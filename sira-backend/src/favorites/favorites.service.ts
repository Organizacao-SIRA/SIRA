import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: string, dto: AddFavoriteDto) {
    await this.prisma.material.upsert({
      where: { id: dto.id },
      update: {},
      create: {
        id: dto.id,
        type: dto.type,
        title: dto.title,
        authors: dto.authors,
        year: dto.year || 'N/A',
        source: dto.source,
        abstract: dto.abstract,
        url: dto.url,
        image: dto.image,
        relevance: dto.relevance ?? 0,
      },
    });

    try {
      return await this.prisma.favorite.create({
        data: { userId, materialId: dto.id },
        include: { material: true },
      });
    } catch {
      throw new ConflictException('Material já está nos favoritos');
    }
  }

  async findAll(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { material: true },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map(f => ({
      favoriteId: f.id,
      addedAt: f.createdAt,
      ...f.material,
      year: String(f.material.year || 'N/A'),
    }));
  }

  async remove(userId: string, materialId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_materialId: { userId, materialId } },
    });

    if (!favorite) throw new NotFoundException('Favorito não encontrado');

    await this.prisma.favorite.delete({
      where: { userId_materialId: { userId, materialId } },
    });

    return { message: 'Removido dos favoritos' };
  }
}
