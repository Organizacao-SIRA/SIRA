import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: 'Adicionar material aos favoritos' })
  add(@CurrentUser() user: JwtPayload, @Body() dto: AddFavoriteDto) {
    return this.favoritesService.add(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar favoritos do usuário' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.favoritesService.findAll(user.sub);
  }

  @Delete(':materialId')
  @ApiOperation({ summary: 'Remover material dos favoritos' })
  remove(@CurrentUser() user: JwtPayload, @Param('materialId') materialId: string) {
    return this.favoritesService.remove(user.sub, materialId);
  }
}
