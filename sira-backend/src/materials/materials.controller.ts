import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MaterialsService, SearchFilters } from './materials.service';
import { MaterialDto } from './dto/material.dto';
import { ChatSearchResponseDto } from './dto/chat-search-response.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('Materials')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get('search')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Busca unificada em APIs acadêmicas externas' })
  @ApiResponse({ status: 200, type: [MaterialDto] })
  @ApiQuery({ name: 'types', required: false, enum: ['book', 'article'] })
  @ApiQuery({ name: 'area', required: false })
  @ApiQuery({ name: 'openAccessOnly', required: false })
  @ApiQuery({ name: 'yearFrom', required: false })
  async search(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('types') types?: string,
    @Query('area') area?: string,
    @Query('openAccessOnly') openAccessOnly?: string,
    @Query('yearFrom') yearFrom?: string,
    @CurrentUser() user?: JwtPayload,
  ): Promise<{ items: MaterialDto[]; total: number }> {
    const filters: SearchFilters = {
      types: types ? ([types] as ('book' | 'article')[]) : [],
      area: area || null,
      openAccessOnly: openAccessOnly === 'true',
      yearFrom: yearFrom ? Number(yearFrom) : null,
    };
    return this.materialsService.search(query, user?.sub, Number(page) || 0, Number(limit) || 4, filters);
  }

  @Get('chat')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Busca conversacional (Chat IA)' })
  @ApiResponse({ status: 200, type: ChatSearchResponseDto })
  @ApiQuery({ name: 'types', required: false, enum: ['book', 'article'] })
  @ApiQuery({ name: 'area', required: false })
  @ApiQuery({ name: 'openAccessOnly', required: false })
  @ApiQuery({ name: 'yearFrom', required: false })
  @ApiQuery({ name: 'excludeIds', required: false, description: 'IDs de materiais já exibidos, separados por vírgula' })
  @ApiQuery({ name: 'diversify', required: false, description: 'Quando true, busca uma rodada alternativa de sugestões' })
  async chat(
    @Query('prompt') prompt: string,
    @Query('types') types?: string,
    @Query('area') area?: string,
    @Query('openAccessOnly') openAccessOnly?: string,
    @Query('yearFrom') yearFrom?: string,
    @Query('excludeIds') excludeIds?: string,
    @Query('diversify') diversify?: string,
    @Headers('accept-language') acceptLanguage?: string,
    @CurrentUser() user?: JwtPayload,
  ): Promise<ChatSearchResponseDto> {
    const filters: SearchFilters = {
      types: types ? ([types] as ('book' | 'article')[]) : [],
      area: area || null,
      openAccessOnly: openAccessOnly === 'true',
      yearFrom: yearFrom ? Number(yearFrom) : null,
    };
    return this.materialsService.chatSearch(prompt, user?.sub, {
      filters,
      excludeIds: excludeIds
        ? excludeIds.split(',').map(id => id.trim()).filter(Boolean).slice(0, 80)
        : [],
      diversify: diversify === 'true',
      locale: acceptLanguage,
    });
  }
}
