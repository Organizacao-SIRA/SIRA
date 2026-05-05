import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import {
  ACADEMIC_GOAL_SET,
  ACADEMIC_GOALS,
  EDUCATION_LEVEL_SET,
  EDUCATION_LEVELS,
  LANGUAGE_SET,
  LANGUAGES,
  MATERIAL_LEVEL_SET,
  MATERIAL_LEVELS,
  PREFERENCE_TOPIC_IDS,
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
    this.validateCompleteOnboarding(dto);

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

    this.validateProfileUpdate(dto, current);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    if (this.hasRecommendationRelevantChanges(dto)) {
      await this.invalidateRecommendationCache(userId);
    }

    return this.safeUser(user);
  }

  private validateCompleteOnboarding(dto: CompleteOnboardingDto) {
    if (!EDUCATION_LEVEL_SET.has(dto.educationLevel)) {
      throw new BadRequestException('Nível de escolaridade inválido');
    }

    this.validateStringList(dto.languages, LANGUAGE_SET, 'Idioma inválido');
    this.validateStringList(dto.materialLevels, MATERIAL_LEVEL_SET, 'Nível de material inválido');

    if (!dto.wantsBooks && !dto.wantsArticles) {
      throw new BadRequestException('Selecione pelo menos um formato de material');
    }

    if (dto.interests.length < 3) {
      throw new BadRequestException('Selecione pelo menos 3 tópicos de interesse');
    }

    this.validateStringList(dto.interests, PREFERENCE_TOPIC_IDS, 'Tópico de interesse inválido');

    if (dto.academicGoal && !ACADEMIC_GOAL_SET.has(dto.academicGoal)) {
      throw new BadRequestException('Objetivo acadêmico inválido');
    }
  }

  private validateProfileUpdate(dto: UpdateProfileDto, current: any) {
    if (dto.educationLevel && !EDUCATION_LEVEL_SET.has(dto.educationLevel)) {
      throw new BadRequestException('Nível de escolaridade inválido');
    }

    if (dto.languages) {
      this.validateStringList(dto.languages, LANGUAGE_SET, 'Idioma inválido');
    }

    if (dto.materialLevels) {
      this.validateStringList(dto.materialLevels, MATERIAL_LEVEL_SET, 'Nível de material inválido');
    }

    if (dto.interests) {
      this.validateStringList(dto.interests, PREFERENCE_TOPIC_IDS, 'Tópico de interesse inválido');
    }

    if (dto.academicGoal && !ACADEMIC_GOAL_SET.has(dto.academicGoal)) {
      throw new BadRequestException('Objetivo acadêmico inválido');
    }

    const wantsBooks = dto.wantsBooks ?? current.wantsBooks;
    const wantsArticles = dto.wantsArticles ?? current.wantsArticles;
    if (!wantsBooks && !wantsArticles) {
      throw new BadRequestException('Selecione pelo menos um formato de material');
    }
  }

  private validateStringList(values: string[], allowed: Set<string>, message: string) {
    const invalid = values.find(value => !allowed.has(value));
    if (invalid) throw new BadRequestException(message);
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
