import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { ERROR_CODES } from '../common/constants/error-codes';
import { conflictError, notFoundError } from '../common/errors/http-error';

type FavoriteTypeFilter = 'book' | 'article';
type FavoriteWithMaterial = {
  id: string;
  createdAt: Date;
  material: Record<string, any> & {
    year?: string | null;
    aiJustification?: string | null;
  };
};

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: string, dto: AddFavoriteDto) {
    const aiJustification = dto.aiExplanation ?? dto.aiJustification ?? null;

    await this.prisma.material.upsert({
      where: { id: dto.id },
      update: {
        aiJustification: aiJustification ?? undefined,
      },
      create: {
        id: dto.id,
        type: dto.type,
        title: dto.title,
        authors: dto.authors,
        year: dto.year || 'N/A',
        source: dto.source,
        relevance: dto.relevance ?? 0,
        abstract: dto.abstract ?? null,
        url: dto.url ?? null,
        image: dto.image ?? null,
        doi: dto.doi ?? null,
        isbn: dto.isbn ?? null,
        level: dto.level ?? null,
        thematicArea: dto.thematicArea ?? null,
        provider: dto.provider ?? null,
        aiJustification,
      },
    });

    try {
      const favorite = await this.prisma.favorite.create({
        data: { userId, materialId: dto.id },
        include: { material: true },
      });
      await this.invalidateRecommendationCache(userId);
      return favorite;
    } catch {
      throw conflictError(ERROR_CODES.FAVORITE_ALREADY_EXISTS, 'Material já está nos favoritos');
    }
  }

  async findIds(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      select: { materialId: true },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map(f => f.materialId);
  }

  async findAll(userId: string, page = 0, limit = 20, type?: string) {
    const currentPage = Number.isFinite(page) ? Math.max(0, Math.floor(page)) : 0;
    const pageSize = Number.isFinite(limit) ? Math.min(50, Math.max(1, Math.floor(limit))) : 20;
    const typeFilter = this.normalizeTypeFilter(type);
    const where = typeFilter
      ? { userId, material: { is: { type: typeFilter } } }
      : { userId };

    const [favorites, total, counts] = await Promise.all([
      this.prisma.favorite.findMany({
        where,
        include: { material: true },
        orderBy: { createdAt: 'desc' },
        skip: currentPage * pageSize,
        take: pageSize,
      }),
      this.prisma.favorite.count({ where }),
      this.getCounts(userId),
    ]);

    return {
      items: favorites.map(f => this.toFavoriteItem(f)),
      total,
      page: currentPage,
      totalPages: Math.ceil(total / pageSize),
      counts,
    };
  }

  private async getCounts(userId: string) {
    const [all, book, article] = await Promise.all([
      this.prisma.favorite.count({ where: { userId } }),
      this.prisma.favorite.count({ where: { userId, material: { is: { type: 'book' } } } }),
      this.prisma.favorite.count({ where: { userId, material: { is: { type: 'article' } } } }),
    ]);

    return { all, book, article };
  }

  private normalizeTypeFilter(type?: string): FavoriteTypeFilter | undefined {
    return type === 'book' || type === 'article' ? type : undefined;
  }

  private toFavoriteItem(f: FavoriteWithMaterial) {
    return {
      favoriteId: f.id,
      addedAt: f.createdAt,
      ...f.material,
      year: String(f.material.year || 'N/A'),
      aiExplanation: f.material.aiJustification,
    };
  }

  async remove(userId: string, materialId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_materialId: { userId, materialId } },
    });

    if (!favorite) throw notFoundError(ERROR_CODES.FAVORITE_NOT_FOUND, 'Favorito não encontrado');

    await this.prisma.favorite.delete({
      where: { userId_materialId: { userId, materialId } },
    });

    await this.invalidateRecommendationCache(userId);

    return { message: 'Removido dos favoritos' };
  }

  private async invalidateRecommendationCache(userId: string) {
    await this.prisma.recommendationCache.deleteMany({ where: { userId } });
  }
}
