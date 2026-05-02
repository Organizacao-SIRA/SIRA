import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { MaterialsService } from '../materials/materials.service';
import { MaterialDto } from '../materials/dto/material.dto';

export interface RecommendationItem extends MaterialDto {
  aiExplanation: string | null;
}

export interface RecommendationResult {
  recommendations: RecommendationItem[];
  basedOn: { favorites: number; searches: number };
  generatedAt: Date;
}

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
  private readonly anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  constructor(
    private readonly prisma: PrismaService,
    private readonly materialsService: MaterialsService,
  ) {}

  async getRecommendations(userId: string): Promise<RecommendationResult> {
    const cached = await this.prisma.recommendationCache.findUnique({ where: { userId } });
    if (cached) {
      return {
        recommendations: cached.items as unknown as RecommendationItem[],
        basedOn: cached.basedOn as { favorites: number; searches: number },
        generatedAt: cached.generatedAt,
      };
    }
    return this.generateAndCache(userId);
  }

  async refreshRecommendations(userId: string): Promise<RecommendationResult> {
    return this.generateAndCache(userId);
  }

  private async generateAndCache(userId: string): Promise<RecommendationResult> {
    const [favorites, recentSearches] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        include: { material: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    if (favorites.length === 0 && recentSearches.length === 0) {
      throw new BadRequestException(
        'Adicione favoritos ou realize buscas para receber recomendações personalizadas.',
      );
    }

    const queries = [
      ...favorites.slice(0, 3).map(f => f.material.title),
      ...recentSearches.slice(0, 3).map(s => s.query),
    ].filter(Boolean);

    const uniqueQueries = [...new Set(queries)].slice(0, 4);

    const candidatesArrays: MaterialDto[][] = [];
    for (let i = 0; i < uniqueQueries.length; i++) {
      const { items } = await this.materialsService.search(uniqueQueries[i]);
      candidatesArrays.push(items);
      if (i < uniqueQueries.length - 1) await new Promise(r => setTimeout(r, 300));
    }

    const favoriteIds = new Set(favorites.map(f => f.materialId));
    const seen = new Set<string>();
    const candidates: MaterialDto[] = [];

    for (const results of candidatesArrays) {
      for (const item of results) {
        if (!seen.has(item.id) && !favoriteIds.has(item.id)) {
          seen.add(item.id);
          candidates.push(item);
        }
      }
    }

    if (candidates.length === 0) {
      throw new BadRequestException(
        'Não foi possível encontrar candidatos para recomendação. Tente novamente mais tarde.',
      );
    }

    const recommendations = await this.rankWithClaude(favorites, recentSearches, candidates);
    const basedOn = { favorites: favorites.length, searches: recentSearches.length };

    const cached = await this.prisma.recommendationCache.upsert({
      where: { userId },
      create: { userId, items: recommendations as any, basedOn },
      update: { items: recommendations as any, basedOn, generatedAt: new Date() },
    });

    return { recommendations, basedOn, generatedAt: cached.generatedAt };
  }

  private async rankWithClaude(
    favorites: Array<{ material: { title: string; authors: string; year: string; type: string; abstract: string | null } }>,
    searches: Array<{ query: string }>,
    candidates: MaterialDto[],
  ): Promise<RecommendationItem[]> {
    const favoritesText = favorites
      .map(f => `- "${f.material.title}" (${f.material.authors}, ${f.material.year}) [${f.material.type}]`)
      .join('\n') || 'Nenhum favorito ainda';

    const searchesText = searches
      .map(s => `- "${s.query}"`)
      .join('\n') || 'Nenhuma busca recente';

    const candidatesText = candidates
      .map(c =>
        `ID:${c.id} | ${c.type} | "${c.title}" | ${c.authors} | ${c.year || 'N/A'} | ${(c.abstract || '').substring(0, 250)}`,
      )
      .join('\n');

    const topN = Math.min(8, candidates.length);

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: [
          {
            type: 'text' as const,
            text: 'Você é um sistema de recomendação acadêmica. Analise o perfil do usuário e selecione os materiais mais relevantes da lista de candidatos. Retorne APENAS JSON válido, sem markdown, sem texto extra fora do JSON.',
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [
          {
            role: 'user',
            content: `FAVORITOS DO USUÁRIO:\n${favoritesText}\n\nBUSCAS RECENTES:\n${searchesText}\n\nCANDIDATOS:\n${candidatesText}\n\nSelecione os TOP ${topN} materiais mais relevantes para este usuário. Para cada um:\n- Escreva UMA frase curta em português explicando por que é relevante\n- Atribua um score de relevância de 0 a 100 baseado em quão bem o material se alinha com o perfil do usuário (favoritos e buscas)\n\nJSON: {"recommendations": [{"id": "...", "explanation": "...", "relevance": 0}]}`,
          },
        ],
      });

      const raw = response.content[0].type === 'text' ? response.content[0].text : '';
      const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(text);

      const metaMap = new Map<string, { explanation: string; relevance: number }>(
        parsed.recommendations.map((r: { id: string; explanation: string; relevance: number }) => [
          r.id,
          { explanation: r.explanation, relevance: Math.min(100, Math.max(0, Math.round(r.relevance))) },
        ]),
      );

      return candidates
        .filter(c => metaMap.has(c.id))
        .map(c => ({ ...c, aiExplanation: metaMap.get(c.id)!.explanation, relevance: metaMap.get(c.id)!.relevance }))
        .sort((a, b) => b.relevance - a.relevance);
    } catch (error) {
      this.logger.error(`Erro ao chamar Claude: ${error.message}`);
      return candidates.slice(0, topN).map(c => ({ ...c, aiExplanation: null, relevance: 0 }));
    }
  }
}
