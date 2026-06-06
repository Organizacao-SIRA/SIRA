import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MaterialDto } from '../dto/material.dto';

/**
 * Único ponto de acesso ao Prisma do módulo materials: upsert de material,
 * histórico de busca e invalidação do cache de recomendações. Sem HTTP/scoring/IA.
 */
@Injectable()
export class MaterialPersistenceService {
  private readonly SEARCH_INVALIDATION_THRESHOLD = 5;

  constructor(private readonly prisma: PrismaService) {}

  async ensureMaterialExists(data: MaterialDto) {
    const payload = {
      id: data.id,
      type: data.type,
      title: data.title,
      authors: data.authors,
      year: data.year.toString(),
      source: data.source,
      provider: data.provider ?? null,
      relevance: data.relevance,
      abstract: data.abstract ?? null,
      image: data.image ?? null,
      url: data.url ?? null,
      isOpenAccess: data.isOpenAccess ?? false,
      thematicArea: data.thematicArea ?? null,
      doi: data.doi ?? null,
      isbn: data.isbn ?? null,
      level: data.level ?? null,
      aiJustification: data.aiJustification ?? null,
    };
    return this.prisma.material.upsert({
      where: { id: data.id },
      create: payload,
      update: {
        level: payload.level ?? undefined,
        isOpenAccess: payload.isOpenAccess,
        url: payload.url ?? undefined,
      },
    });
  }

  /** Perfil do usuário usado para personalizar o prompt da IA no chatSearch. */
  async getUserForChat(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        course: true,
        educationLevel: true,
        mainArea: true,
        interests: true,
        academicGoal: true,
        materialLevels: true,
        languages: true,
        uiLocale: true,
      },
    });
  }

  async saveSearchHistory(userId: string, query: string): Promise<void> {
    await this.prisma.searchHistory.create({ data: { userId, query } });
    await this.maybeInvalidateRecommendationCache(userId);
  }

  private async maybeInvalidateRecommendationCache(userId: string): Promise<void> {
    const cache = await this.prisma.recommendationCache.findUnique({
      where: { userId },
      select: { generatedAt: true },
    });
    if (!cache) return;

    const searchesSince = await this.prisma.searchHistory.count({
      where: { userId, createdAt: { gt: cache.generatedAt } },
    });

    if (searchesSince >= this.SEARCH_INVALIDATION_THRESHOLD) {
      await this.prisma.recommendationCache.deleteMany({ where: { userId } });
    }
  }
}
