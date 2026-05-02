<<<<<<< HEAD
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.safeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    return this.safeUser(user);
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
    };
=======
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
>>>>>>> develop
  }
}
