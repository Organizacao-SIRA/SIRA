import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationsService, RecommendationResult } from './recommendations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('Recommendations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  @ApiOperation({ summary: 'Retorna recomendações do cache ou gera novas se não houver cache' })
  getRecommendations(@CurrentUser() user: JwtPayload): Promise<RecommendationResult> {
    return this.recommendationsService.getRecommendations(user.sub);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Força a regeneração das recomendações via IA' })
  refreshRecommendations(@CurrentUser() user: JwtPayload): Promise<RecommendationResult> {
    return this.recommendationsService.refreshRecommendations(user.sub);
  }
}
