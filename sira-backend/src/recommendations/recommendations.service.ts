import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { MaterialsService } from '../materials/materials.service';
import { MaterialDto, MaterialType } from '../materials/dto/material.dto';
import { getPreferenceTopicKeywords, getPreferenceTopicLabels } from '../users/preferences-options';

export interface RecommendationItem extends MaterialDto {
  aiExplanation: string | null;
}

export interface RecommendationResult {
  recommendations: RecommendationItem[];
  basedOn: { favorites: number; searches: number; preferences: boolean };
  generatedAt: Date;
}

type RecommendationUser = {
  course: string | null;
  educationLevel: string | null;
  mainArea: string | null;
  subAreas: string | null;
  languages: string[];
  materialLevels: string[];
  wantsBooks: boolean;
  wantsArticles: boolean;
  interests: string[];
  academicGoal: string | null;
  onboardingCompletedAt: Date | null;
};

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
      const basedOn = cached.basedOn as { favorites: number; searches: number; preferences?: boolean };
      return {
        recommendations: cached.items as unknown as RecommendationItem[],
        basedOn: {
          favorites: basedOn.favorites,
          searches: basedOn.searches,
          preferences: Boolean(basedOn.preferences),
        },
        generatedAt: cached.generatedAt,
      };
    }
    return this.generateAndCache(userId);
  }

  async refreshRecommendations(userId: string): Promise<RecommendationResult> {
    return this.generateAndCache(userId);
  }

  private async generateAndCache(userId: string): Promise<RecommendationResult> {
    const [user, favorites, recentSearches] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          course: true,
          educationLevel: true,
          mainArea: true,
          subAreas: true,
          languages: true,
          materialLevels: true,
          wantsBooks: true,
          wantsArticles: true,
          interests: true,
          academicGoal: true,
          onboardingCompletedAt: true,
        },
      }),
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

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const hasBehaviorSignals = favorites.length > 0 || recentSearches.length > 0;
    const hasCompletedOnboarding = Boolean(user.onboardingCompletedAt);

    if (!hasBehaviorSignals && !hasCompletedOnboarding) {
      throw new BadRequestException(
        'Conclua suas preferências acadêmicas ou realize buscas para receber recomendações personalizadas.',
      );
    }

    const queries = this.buildRecommendationQueries(user, favorites, recentSearches, hasBehaviorSignals);

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

    const filteredCandidates = this.filterByPreferredFormats(user, candidates);

    if (filteredCandidates.length === 0) {
      throw new BadRequestException(
        'Não foi possível encontrar candidatos para recomendação. Tente novamente mais tarde.',
      );
    }

    const recommendations = await this.rankWithClaude(user, favorites, recentSearches, filteredCandidates);
    const basedOn = {
      favorites: favorites.length,
      searches: recentSearches.length,
      preferences: hasCompletedOnboarding,
    };

    const cached = await this.prisma.recommendationCache.upsert({
      where: { userId },
      create: { userId, items: recommendations as any, basedOn },
      update: { items: recommendations as any, basedOn, generatedAt: new Date() },
    });

    return { recommendations, basedOn, generatedAt: cached.generatedAt };
  }

  private buildRecommendationQueries(
    user: RecommendationUser,
    favorites: Array<{ material: { title: string } }>,
    searches: Array<{ query: string }>,
    hasBehaviorSignals: boolean,
  ) {
    const preferenceQueries = this.buildPreferenceQueries(user);

    if (!hasBehaviorSignals) {
      return preferenceQueries;
    }

    return [
      ...favorites.slice(0, 2).map(f => f.material.title),
      ...searches.slice(0, 2).map(s => s.query),
      ...preferenceQueries,
    ].filter(Boolean);
  }

  private buildPreferenceQueries(user: RecommendationUser) {
    const keywordsFromInterests = getPreferenceTopicKeywords(user.interests || []);
    const mainAreaLabels = getPreferenceTopicLabels([user.mainArea].filter(Boolean) as string[]);
    const mainAreaKeywords = getPreferenceTopicKeywords([user.mainArea].filter(Boolean) as string[]);
    const preferredLevels = (user.materialLevels || []).join(' ');

    return [
      ...mainAreaLabels.map(label => `${label} ${preferredLevels}`.trim()),
      ...mainAreaKeywords.slice(0, 1),
      `${user.subAreas || ''} ${preferredLevels}`.trim(),
      ...keywordsFromInterests.slice(0, 2),
      `${user.academicGoal || ''} ${user.course || ''} ${preferredLevels}`.trim(),
    ].filter((query): query is string => Boolean(query && query.trim().length >= 2));
  }

  private filterByPreferredFormats(user: RecommendationUser, candidates: MaterialDto[]) {
    return candidates.filter(candidate => {
      if (!user.wantsBooks && candidate.type === MaterialType.BOOK) return false;
      if (!user.wantsArticles && candidate.type === MaterialType.ARTICLE) return false;
      return true;
    });
  }

  private async rankWithClaude(
    user: RecommendationUser,
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

    const preferencesText = this.buildPreferencesText(user);

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
            content: `FAVORITOS DO USUÁRIO:\n${favoritesText}\n\nBUSCAS RECENTES:\n${searchesText}\n\nPREFERÊNCIAS DECLARADAS:\n${preferencesText}\n\nCANDIDATOS:\n${candidatesText}\n\nSelecione os TOP ${topN} materiais mais relevantes para este usuário. Priorize, nesta ordem: favoritos, buscas recentes, interesses declarados, área principal/subáreas, idioma/nível/formato e objetivo acadêmico. Para cada um:\n- Escreva UMA frase curta em português explicando por que é relevante\n- Atribua um score de relevância de 0 a 100\n- Determine o nível do material: "Introdutório", "Intermediário" ou "Avançado"\n\nJSON: {"recommendations": [{"id": "...", "explanation": "...", "relevance": 0, "level": "..."}]}`,
          },
        ],
      });

      const raw = response.content[0].type === 'text' ? response.content[0].text : '';
      const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(text);

      const metaMap = new Map<string, { explanation: string; relevance: number; level: string }>(
        parsed.recommendations.map((r: { id: string; explanation: string; relevance: number; level: string }) => [
          r.id,
          {
            explanation: r.explanation,
            relevance: Math.min(100, Math.max(0, Math.round(r.relevance))),
            level: r.level,
          },
        ]),
      );

      return candidates
        .filter(c => metaMap.has(c.id))
        .map(c => ({
          ...c,
          aiExplanation: metaMap.get(c.id)!.explanation,
          relevance: metaMap.get(c.id)!.relevance,
          level: metaMap.get(c.id)!.level,
        }))
        .sort((a, b) => b.relevance - a.relevance);
    } catch (error) {
      this.logger.error(`Erro ao chamar Claude: ${error.message}`);
      return candidates
        .slice(0, topN)
        .map(c => ({ ...c, aiExplanation: null }))
        .sort((a, b) => b.relevance - a.relevance);
    }
  }

  private buildPreferencesText(user: RecommendationUser) {
    const interestLabels = getPreferenceTopicLabels(user.interests || []);
    const formats = [
      user.wantsBooks ? 'livros' : null,
      user.wantsArticles ? 'artigos' : null,
    ].filter(Boolean);

    return [
      `- Curso: ${user.course || 'Nao informado'}`,
      `- Nivel: ${user.educationLevel || 'Nao informado'}`,
      `- Area principal: ${user.mainArea || 'Nao informada'}`,
      `- Subareas: ${user.subAreas || 'Nao informadas'}`,
      `- Interesses: ${interestLabels.join(', ') || 'Nao informados'}`,
      `- Idiomas preferidos: ${(user.languages || []).join(', ') || 'Nao informados'}`,
      `- Nivel dos materiais: ${(user.materialLevels || []).join(', ') || 'Nao informado'}`,
      `- Formatos desejados: ${formats.join(', ') || 'Nao informados'}`,
      `- Objetivo academico: ${user.academicGoal || 'Nao informado'}`,
    ].join('\n');
  }
}
