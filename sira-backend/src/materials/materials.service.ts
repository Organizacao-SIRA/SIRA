import { Injectable } from '@nestjs/common';
import { MaterialDto } from './dto/material.dto';
import { ChatSearchResponseDto } from './dto/chat-search-response.dto';
import { SearchFilters, ChatSearchOptions } from './types/materials.types';
import { MaterialsOrchestratorService } from './services/materials-orchestrator.service';
import { MaterialPersistenceService } from './services/material-persistence.service';

// Re-export para preservar os imports existentes (ex.: materials.controller).
export type { SearchFilters, ChatSearchOptions } from './types/materials.types';

/**
 * Fachada do módulo materials: expõe os casos de uso e delega a coordenação ao
 * orchestrator e a persistência ao persistence service. Mantém a API pública
 * consumida pelo controller e pelo recommendations.service (`ensureMaterialExists`).
 */
@Injectable()
export class MaterialsService {
  constructor(
    private readonly orchestrator: MaterialsOrchestratorService,
    private readonly persistence: MaterialPersistenceService,
  ) {}

  search(query: string, userId?: string, page = 0, pageSize = 4, filters?: SearchFilters): Promise<{ items: MaterialDto[]; total: number }> {
    return this.orchestrator.search(query, userId, page, pageSize, filters);
  }

  chatSearch(prompt: string, userId?: string, options?: ChatSearchOptions): Promise<ChatSearchResponseDto> {
    return this.orchestrator.chatSearch(prompt, userId, options);
  }

  ensureMaterialExists(data: MaterialDto) {
    return this.persistence.ensureMaterialExists(data);
  }
}
