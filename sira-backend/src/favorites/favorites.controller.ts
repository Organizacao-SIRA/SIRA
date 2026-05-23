import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
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

  @Get('ids')
  @ApiOperation({ summary: 'Listar IDs dos materiais favoritos do usuário' })
  findIds(@CurrentUser() user: JwtPayload) {
    return this.favoritesService.findIds(user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Listar favoritos do usuário' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = '0',
    @Query('limit') limit = '20',
    @Query('type') type?: string,
  ) {
    return this.favoritesService.findAll(user.sub, Number(page), Number(limit), type);
  }

  @Delete(':materialId')
  @ApiOperation({ summary: 'Remover material dos favoritos' })
  remove(@CurrentUser() user: JwtPayload, @Param('materialId') materialId: string) {
    return this.favoritesService.remove(user.sub, materialId);
  }
}
