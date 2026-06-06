import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { MaterialsOrchestratorService } from './services/materials-orchestrator.service';
import { MaterialScoringService } from './services/material-scoring.service';
import { MaterialPersistenceService } from './services/material-persistence.service';
import { MaterialsCacheService } from './cache/materials-cache.service';
import { GoogleBooksClient } from './clients/google-books.client';
import { SemanticScholarClient } from './clients/semantic-scholar.client';
import { OpenAlexClient } from './clients/openalex.client';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [HttpModule, AiModule],
  controllers: [MaterialsController],
  providers: [
    MaterialsService,
    MaterialsOrchestratorService,
    MaterialScoringService,
    MaterialPersistenceService,
    MaterialsCacheService,
    GoogleBooksClient,
    SemanticScholarClient,
    OpenAlexClient,
  ],
  exports: [MaterialsService],
})
export class MaterialsModule {}
