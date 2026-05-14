import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { MaterialsModule } from '../materials/materials.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [MaterialsModule, AiModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
