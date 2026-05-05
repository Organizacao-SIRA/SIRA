import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    if (!wantsBooks && !wantsArticles) {
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
      interests: user.interests,
      academicGoal: user.academicGoal,
      onboardingCompletedAt: user.onboardingCompletedAt,
      hasCompletedOnboarding: Boolean(user.onboardingCompletedAt),
    };
  }
}
