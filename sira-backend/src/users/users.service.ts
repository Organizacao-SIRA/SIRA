import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import {
  ACADEMIC_GOALS,
  EDUCATION_LEVELS,
  LANGUAGES,
  MATERIAL_LEVELS,
  PREFERENCE_TOPICS,
} from './preferences-options';

const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

const isCloudinaryConfigured = () =>
  Boolean(CLOUDINARY_CONFIG.cloud_name && CLOUDINARY_CONFIG.api_key && CLOUDINARY_CONFIG.api_secret);

const useLocalAvatarStorage = () => !isCloudinaryConfigured() && process.env.NODE_ENV !== 'production';
const AVATAR_UPLOAD_DIR = join(process.cwd(), 'uploads', 'avatars');
const AVATAR_EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

if (isCloudinaryConfigured()) {
  cloudinary.config(CLOUDINARY_CONFIG);
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getPreferenceOptions() {
    return {
      topics: PREFERENCE_TOPICS.map(({ id, label, description }) => ({ id, label, description })),
      educationLevels: [...EDUCATION_LEVELS],
      languages: [...LANGUAGES],
      materialLevels: [...MATERIAL_LEVELS],
      academicGoals: [...ACADEMIC_GOALS],
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.safeUser(user);
  }

  async completeOnboarding(userId: string, dto: CompleteOnboardingDto) {
    if (!dto.wantsBooks && !dto.wantsArticles) {
      throw new BadRequestException('Selecione pelo menos um formato de material');
    }

    const exists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!exists) throw new NotFoundException('Usuário não encontrado');

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        course: dto.course,
        educationLevel: dto.educationLevel,
        mainArea: dto.mainArea,
        subAreas: dto.subAreas,
        languages: dto.languages,
        materialLevels: dto.materialLevels,
        wantsBooks: dto.wantsBooks,
        wantsArticles: dto.wantsArticles,
        interests: dto.interests,
        academicGoal: dto.academicGoal,
        onboardingCompletedAt: new Date(),
      },
    });

    await this.invalidateRecommendationCache(userId);

    return this.safeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const current = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!current) throw new NotFoundException('Usuário não encontrado');

    const wantsBooks = dto.wantsBooks ?? current.wantsBooks;
    const wantsArticles = dto.wantsArticles ?? current.wantsArticles;
    if (wantsBooks === false && wantsArticles === false) {
      throw new BadRequestException('Selecione pelo menos um formato de material');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    if (this.hasRecommendationRelevantChanges(dto)) {
      await this.invalidateRecommendationCache(userId);
    }

    return this.safeUser(user);
  }

  async updateAvatar(userId: string, buffer: Buffer, mimetype: string) {
    const current = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!current) throw new NotFoundException('Usuário não encontrado');

    const avatarUrl = await this.uploadAvatarAsset(buffer, mimetype, userId);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    if (current.avatarUrl !== avatarUrl) {
      await this.deleteLocalAvatar(current.avatarUrl);
    }

    return this.safeUser(user);
  }

  async removeAvatar(userId: string) {
    const current = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!current) throw new NotFoundException('Usuário não encontrado');

    await this.deleteAvatarAsset(current.avatarUrl);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });

    return this.safeUser(user);
  }

  private uploadAvatarAsset(buffer: Buffer, mimetype: string, userId: string): Promise<string> {
    if (isCloudinaryConfigured()) {
      return this.uploadToCloudinary(buffer, mimetype, userId);
    }

    if (useLocalAvatarStorage()) {
      return this.uploadToLocalStorage(buffer, mimetype, userId);
    }

    throw new ServiceUnavailableException('Upload de imagem indisponível: Cloudinary não configurado');
  }

  private async uploadToLocalStorage(buffer: Buffer, mimetype: string, userId: string): Promise<string> {
    const ext = AVATAR_EXTENSION_BY_MIME[mimetype];
    if (!ext) throw new BadRequestException('Formato de imagem inválido');

    await mkdir(AVATAR_UPLOAD_DIR, { recursive: true });
    const filename = `${userId}-${Date.now()}.${ext}`;
    await writeFile(join(AVATAR_UPLOAD_DIR, filename), buffer);
    return `/uploads/avatars/${filename}`;
  }

  private uploadToCloudinary(buffer: Buffer, mimetype: string, userId: string): Promise<string> {
    if (!isCloudinaryConfigured()) {
      throw new ServiceUnavailableException('Upload de imagem indisponível: Cloudinary não configurado');
    }

    return new Promise((resolve, reject) => {
      const ext = mimetype.split('/')[1];
      try {
        cloudinary.uploader.upload_stream(
          { folder: 'sira/avatars', public_id: userId, overwrite: true, format: ext },
          (error, result) => {
            if (error || !result) return reject(new BadRequestException('Erro ao enviar imagem para o Cloudinary'));
            resolve(result.secure_url);
          },
        ).end(buffer);
      } catch {
        reject(new ServiceUnavailableException('Upload de imagem indisponível no momento'));
      }
    });
  }

  private async deleteCloudinaryAvatar(avatarUrl: string | null) {
    if (!avatarUrl?.includes('cloudinary.com')) return;
    if (!isCloudinaryConfigured()) return;
    try {
      await cloudinary.uploader.destroy('sira/avatars/' + avatarUrl.split('/').pop()?.split('.')[0]);
    } catch { /* ignora falha ao deletar imagem anterior */ }
  }

  private async deleteLocalAvatar(avatarUrl: string | null) {
    if (!avatarUrl?.startsWith('/uploads/avatars/')) return;
    const filename = basename(avatarUrl);
    if (!extname(filename)) return;

    try {
      await unlink(join(AVATAR_UPLOAD_DIR, filename));
    } catch { /* ignora falha ao deletar imagem anterior */ }
  }

  private async deleteAvatarAsset(avatarUrl: string | null) {
    await Promise.all([
      this.deleteCloudinaryAvatar(avatarUrl),
      this.deleteLocalAvatar(avatarUrl),
    ]);
  }

  private hasRecommendationRelevantChanges(dto: UpdateProfileDto) {
    return [
      'course',
      'educationLevel',
      'mainArea',
      'subAreas',
      'languages',
      'materialLevels',
      'wantsBooks',
      'wantsArticles',
      'wantsOpenAccessOnly',
      'interests',
      'academicGoal',
    ].some(field => Object.prototype.hasOwnProperty.call(dto, field));
  }

  private async invalidateRecommendationCache(userId: string) {
    await this.prisma.recommendationCache.deleteMany({ where: { userId } });
  }

  private safeUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      course: user.course,
      educationLevel: user.educationLevel,
      mainArea: user.mainArea,
      subAreas: user.subAreas,
      languages: user.languages,
      materialLevels: user.materialLevels,
      wantsBooks: user.wantsBooks,
      wantsArticles: user.wantsArticles,
      wantsOpenAccessOnly: user.wantsOpenAccessOnly,
      interests: user.interests,
      academicGoal: user.academicGoal,
      avatarUrl: user.avatarUrl,
      onboardingCompletedAt: user.onboardingCompletedAt,
      hasCompletedOnboarding: Boolean(user.onboardingCompletedAt),
    };
  }
}
