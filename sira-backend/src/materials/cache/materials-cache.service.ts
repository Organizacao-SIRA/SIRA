import { Injectable } from '@nestjs/common';
import { MaterialDto } from '../dto/material.dto';

/**
 * Cache em memória dos resultados de busca de materiais.
 *
 * Fase 1: encapsula o `Map` que vivia no `MaterialsService` (comportamento
 * preservado, mas já removendo entradas expiradas na leitura).
 * Fase 2: este serviço passa a ser LRU com limite de entradas e TTL configurável.
 */
@Injectable()
export class MaterialsCacheService {
  private readonly cache = new Map<string, { data: MaterialDto[]; timestamp: number }>();
  private readonly ttlMs = 3600 * 1000;

  get(key: string): MaterialDto[] | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp >= this.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.data;
  }

  set(key: string, data: MaterialDto[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
