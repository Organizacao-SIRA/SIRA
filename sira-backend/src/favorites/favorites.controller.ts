import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MaterialDto } from '../materials/dto/material.dto';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  async addFavorite(@Request() req: any, @Body() materialData: MaterialDto) {
    return this.favoritesService.addFavorite(req.user.userId, materialData);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.favoritesService.findAll(req.user.userId);
  }

  @Delete(':id')
  async removeFavorite(@Request() req: any, @Param('id') id: string) {
    return this.favoritesService.removeFavorite(req.user.userId, id);
  }
}
