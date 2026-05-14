import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
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
  async search(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: JwtPayload,
  ): Promise<{ items: MaterialDto[]; total: number }> {
    return this.materialsService.search(query, user?.sub, Number(page) || 0, Number(limit) || 4);
  }

  @Get('chat')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Busca conversacional (Chat IA)' })
  @ApiResponse({ status: 200, type: ChatSearchResponseDto })
  async chat(
    @Query('prompt') prompt: string,
    @CurrentUser() user?: JwtPayload,
  ): Promise<ChatSearchResponseDto> {
    return this.materialsService.chatSearch(prompt, user?.sub);
  }
}
