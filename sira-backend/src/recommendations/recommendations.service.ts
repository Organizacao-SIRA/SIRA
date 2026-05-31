import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MaterialsService } from '../materials/materials.service';
import { MaterialDto, MaterialType } from '../materials/dto/material.dto';
import { getPreferenceTopicKeywords, getPreferenceTopicLabels } from '../users/preferences-options';
import { AiProvider } from '../ai/ai-provider.abstract';

export interface RecommendationItem extends MaterialDto {
  aiExplanation: string | null;
}

export interface RecommendationResult {
  recommendations: RecommendationItem[];
  basedOn: { favorites: number; searches: number; preferences: boolean };
  generatedAt: Date;
  coldStart?: true;
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
  wantsOpenAccessOnly: boolean;
  interests: string[];
  academicGoal: string | null;
  onboardingCompletedAt: Date | null;
  uiLocale: string | null;
};

const normalizeUiLocale = (locale?: string | null): 'pt-BR' | 'en-US' => {
  if (!locale) return 'pt-BR';
  return locale.toLowerCase().startsWith('en') ? 'en-US' : 'pt-BR';
};

const aiOutputLanguage = (locale: 'pt-BR' | 'en-US') =>
  locale === 'en-US' ? 'English' : 'português do Brasil';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
  private readonly CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  private readonly inflightGenerations = new Map<string, Promise<RecommendationResult>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly materialsService: MaterialsService,
    private readonly ai: AiProvider,
  ) {}

  async trackEvent(userId: string, materialId: string, eventType: 'impression' | 'click' | 'favorite'): Promise<void> {
    await this.prisma.recommendationEvent.create({ data: { userId, materialId, eventType } });
  }

  async getRecommendations(userId: string): Promise<RecommendationResult> {
    const cached = await this.prisma.recommendationCache.findUnique({ where: { userId } });
    if (cached && Date.now() - cached.generatedAt.getTime() < this.CACHE_TTL_MS) {
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

  private generateAndCache(userId: string): Promise<RecommendationResult> {
    const inflight = this.inflightGenerations.get(userId);
    if (inflight) return inflight;

    const promise = this.doGenerateAndCache(userId).finally(() => {
      this.inflightGenerations.delete(userId);
    });

    this.inflightGenerations.set(userId, promise);
    return promise;
  }

  private async doGenerateAndCache(userId: string): Promise<RecommendationResult> {
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
          wantsOpenAccessOnly: true,
          interests: true,
          academicGoal: true,
          onboardingCompletedAt: true,
          uiLocale: true,
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
      return {
        recommendations: [],
        basedOn: { favorites: 0, searches: 0, preferences: false },
        generatedAt: new Date(),
        coldStart: true,
      };
    }

    const queries = this.buildRecommendationQueries(user, favorites, recentSearches, hasBehaviorSignals);

    const uniqueQueries = [...new Set(queries)].slice(0, 4);

    const searchFilters = {
      types: [],
      area: null,
      openAccessOnly: user.wantsOpenAccessOnly,
      yearFrom: null,
      languages: user.languages?.length ? user.languages : [],
    };

    const candidatesArrays = await Promise.all(
      uniqueQueries.map(query => this.materialsService.search(query, undefined, 0, 4, searchFilters).then(r => r.items)),
    );

    const favoriteIds = new Set(favorites.map(f => f.materialId));
    const allItems = candidatesArrays.flat().filter(item => !favoriteIds.has(item.id));
    const candidates = this.deduplicateByContent(allItems);

    const filteredCandidates = this.filterByPreferredFormats(user, candidates);

    if (filteredCandidates.length === 0) {
      return {
        recommendations: [],
        basedOn: { favorites: favorites.length, searches: recentSearches.length, preferences: hasCompletedOnboarding },
        generatedAt: new Date(),
        coldStart: true,
      };
    }

    const enrichedCandidates = await this.enrichWithStoredLevels(filteredCandidates);
    const ranked = await this.rankWithClaude(user, favorites, recentSearches, enrichedCandidates);
    const recommendations = this.filterByPreferredLevels(user, ranked);

    await Promise.all(
      recommendations.map(item =>
        this.materialsService.ensureMaterialExists({
          ...item,
          aiJustification: item.aiExplanation ?? undefined,
        }),
      ),
    );

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

  private async enrichWithStoredLevels(candidates: MaterialDto[]): Promise<MaterialDto[]> {
    const stored = await this.prisma.material.findMany({
      where: { id: { in: candidates.map(c => c.id) }, level: { not: null } },
      select: { id: true, level: true },
    });
    if (stored.length === 0) return candidates;
    const levelMap = new Map(stored.map(m => [m.id, m.level!]));
    return candidates.map(c => (levelMap.has(c.id) ? { ...c, level: levelMap.get(c.id) } : c));
  }

  private contentFingerprints(item: MaterialDto): string[] {
    const fps: string[] = [];
    if (item.doi) {
      fps.push(`doi:${item.doi.replace(/^https?:\/\/doi\.org\//i, '').toLowerCase().trim()}`);
    }
    const title = item.title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    const firstAuthor = item.authors.split(',')[0].toLowerCase().trim().split(' ')[0];
    fps.push(`title:${title}|author:${firstAuthor}`);
    return fps;
  }

  private deduplicateByContent(items: MaterialDto[]): MaterialDto[] {
    const best = new Map<string, MaterialDto>();

    for (const item of items) {
      const fps = this.contentFingerprints(item);
      const matchedFp = fps.find(fp => best.has(fp));

      if (matchedFp) {
        const existing = best.get(matchedFp)!;
        if (item.relevance > existing.relevance) {
          this.contentFingerprints(existing).forEach(fp => best.delete(fp));
          fps.forEach(fp => best.set(fp, item));
        }
      } else {
        fps.forEach(fp => best.set(fp, item));
      }
    }

    return [...new Set(best.values())];
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

  private filterByPreferredLevels(user: RecommendationUser, items: RecommendationItem[]): RecommendationItem[] {
    if (!user.materialLevels?.length) return items;
    const preferred = new Set(user.materialLevels);
    const filtered = items.filter(item => !item.level || preferred.has(item.level));
    return filtered.length >= 2 ? filtered : items;
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

    const candidatesText = candidates
      .map(c =>
        `ID:${c.id} | ${c.type} | nivel:${c.level || '?'} | "${c.title}" | ${c.authors} | ${c.year || 'N/A'} | ${(c.abstract || '').substring(0, 250)}`,
      )
      .join('\n');

    const topN = Math.min(8, candidates.length);
    const outputLanguage = aiOutputLanguage(normalizeUiLocale(user.uiLocale));

    // Perfil no system: muda só quando o usuário edita o onboarding — cacheado pela Anthropic entre gerações.
    // Favoritos/buscas/candidatos no user: mudam a cada geração — não cacheáveis.
    const systemPrompt = `Você é um sistema de recomendação acadêmica. Retorne APENAS JSON válido, sem markdown, sem texto extra fora do JSON.\n\nPERFIL DO USUÁRIO:\n${this.buildPreferencesText(user)}`;

    try {
      const raw = await this.ai.complete({
        system: systemPrompt,
        user: `FAVORITOS DO USUÁRIO:\n${favoritesText}\n\nBUSCAS RECENTES:\n${searchesText}\n\nCANDIDATOS:\n${candidatesText}\n\nSelecione os TOP ${topN} materiais mais relevantes para este usuário. Priorize, nesta ordem: favoritos, buscas recentes, interesses declarados, área principal/subáreas, idioma/nível/formato e objetivo acadêmico. Para cada um:\n- Escreva UMA frase curta em ${outputLanguage} explicando por que é relevante\n- Atribua um score de relevância de 0 a 100\n- Para o campo "level": se o candidato já tem nivel diferente de "?", use exatamente esse valor. Caso seja "?", determine: "Introdutório", "Intermediário" ou "Avançado"\n\nJSON: {"recommendations": [{"id": "...", "explanation": "...", "relevance": 0, "level": "..."}]}`,
        maxTokens: 1024,
      });
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
