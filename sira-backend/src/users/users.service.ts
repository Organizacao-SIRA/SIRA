import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
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

const AVATAR_PUBLIC_PREFIX = '/uploads/avatars/';
const AVATAR_DISK_DIR = join(process.cwd(), 'uploads', 'avatars');

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

  async updateAvatar(userId: string, filename: string) {
    const current = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!current) throw new NotFoundException('Usuário não encontrado');

    this.deleteAvatarFile(current.avatarUrl);

    const avatarUrl = `${AVATAR_PUBLIC_PREFIX}${filename}`;
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return this.safeUser(user);
  }

  async removeAvatar(userId: string) {
    const current = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!current) throw new NotFoundException('Usuário não encontrado');

    this.deleteAvatarFile(current.avatarUrl);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });

    return this.safeUser(user);
  }

  private deleteAvatarFile(avatarUrl: string | null) {
    if (!avatarUrl?.startsWith(AVATAR_PUBLIC_PREFIX)) return;
    const filename = avatarUrl.slice(AVATAR_PUBLIC_PREFIX.length);
    if (!filename || filename.includes('/') || filename.includes('\\')) return;
    const fullPath = join(AVATAR_DISK_DIR, filename);
    if (existsSync(fullPath)) {
      try { unlinkSync(fullPath); } catch { /* ignora falha de I/O */ }
    }
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
