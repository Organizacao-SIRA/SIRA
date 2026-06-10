import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ERROR_CODES } from '../common/constants/error-codes';
import { badRequestError } from '../common/errors/http-error';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { AvatarStorageService } from './avatar-storage/avatar-storage.service';
import {
  ACADEMIC_GOALS,
  EDUCATION_LEVELS,
  LANGUAGES,
  MATERIAL_LEVELS,
  PREFERENCE_TOPICS,
} from './preferences-options';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly avatarStorage: AvatarStorageService,
  ) {}

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
      throw badRequestError(ERROR_CODES.PROFILE_FORMAT_REQUIRED, 'Selecione pelo menos um formato de material');
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
        currentWork: dto.currentWork,
        languages: dto.languages,
        materialLevels: dto.materialLevels,
        wantsBooks: dto.wantsBooks,
        wantsArticles: dto.wantsArticles,
        wantsOpenAccessOnly: dto.wantsOpenAccessOnly,
        uiLocale: dto.uiLocale,
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
      throw badRequestError(ERROR_CODES.PROFILE_FORMAT_REQUIRED, 'Selecione pelo menos um formato de material');
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

    const avatarUrl = await this.avatarStorage.upload(buffer, mimetype, userId);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    if (current.avatarUrl !== avatarUrl) {
      await this.avatarStorage.deleteReplaced(current.avatarUrl, avatarUrl);
    }

    return this.safeUser(user);
  }

  async removeAvatar(userId: string) {
    const current = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!current) throw new NotFoundException('Usuário não encontrado');

    await this.avatarStorage.delete(current.avatarUrl);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });

    return this.safeUser(user);
  }

  private hasRecommendationRelevantChanges(dto: UpdateProfileDto) {
    return [
      'course',
      'educationLevel',
      'mainArea',
      'subAreas',
      'currentWork',
      'languages',
      'materialLevels',
      'wantsBooks',
      'wantsArticles',
      'wantsOpenAccessOnly',
      'uiLocale',
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
      currentWork: user.currentWork,
      languages: user.languages,
      materialLevels: user.materialLevels,
      wantsBooks: user.wantsBooks,
      wantsArticles: user.wantsArticles,
      wantsOpenAccessOnly: user.wantsOpenAccessOnly,
      uiLocale: user.uiLocale || 'pt-BR',
      interests: user.interests,
      academicGoal: user.academicGoal,
      avatarUrl: user.avatarUrl,
      onboardingCompletedAt: user.onboardingCompletedAt,
      hasCompletedOnboarding: Boolean(user.onboardingCompletedAt),
    };
  }
}
