import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MaterialsService } from '../materials/materials.service';
import { MaterialDto } from '../materials/dto/material.dto';

@Injectable()
export class FavoritesService {
  constructor(
    private prisma: PrismaService,
    private materialsService: MaterialsService,
  ) {}

  async addFavorite(userId: string, materialData: MaterialDto) {
    // 1. Garantir que o material existe no nosso banco local
    await this.materialsService.ensureMaterialExists(materialData);

    // 2. Verificar se já é favorito para evitar duplicidade
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_materialId: {
          userId,
          materialId: materialData.id,
        },
      },
    });

    if (existingFavorite) {
      throw new ConflictException('Material já está nos favoritos');
    }

    // 3. Criar o vínculo de favorito
    return this.prisma.favorite.create({
      data: {
        userId,
        materialId: materialData.id,
      },
      include: {
        material: true,
      },
    });
  }

  async removeFavorite(userId: string, materialId: string) {
    try {
      return await this.prisma.favorite.delete({
        where: {
          userId_materialId: {
            userId,
            materialId,
          },
        },
      });
    } catch (error) {
      throw new NotFoundException('Favorito não encontrado');
    }
  }

  async findAll(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        material: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Retorna apenas os dados do material para facilitar o mapeamento no front
    return favorites.map((f) => f.material);
  }
}
