import { Injectable } from '@nestjs/common';

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const DEFAULT_MAX_ITEMS = 200;
const DEFAULT_TTL_SECONDS = 3600;

/**
 * Cache em memória LRU + TTL para o módulo materials.
 *
 * Implementado sobre um único `Map` (sem dependência externa). A ordem de
 * inserção do `Map` é usada como ordem de recência: a primeira chave é a menos
 * usada recentemente (candidata à evicção), a última é a mais recente.
 *
 * - **TTL por entrada**: expira por tempo; entradas expiradas são removidas na leitura.
 * - **Limite de entradas**: ao exceder `maxItems`, remove as mais antigas (LRU).
 * - Como o tamanho é limitado, a memória não cresce indefinidamente mesmo com
 *   entradas expiradas que nunca mais sejam lidas (são empurradas para fora pela evicção).
 *
 * Configurável por env (defaults seguros): `MATERIALS_CACHE_MAX_ITEMS`,
 * `MATERIALS_CACHE_TTL_SECONDS`.
 */
@Injectable()
export class MaterialsCacheService {
  private readonly store = new Map<string, CacheEntry>();
  private readonly maxItems: number;
  private readonly defaultTtlMs: number;

  constructor() {
    const maxItems = Number(process.env.MATERIALS_CACHE_MAX_ITEMS);
    const ttlSeconds = Number(process.env.MATERIALS_CACHE_TTL_SECONDS);
    this.maxItems = Number.isFinite(maxItems) && maxItems > 0 ? Math.floor(maxItems) : DEFAULT_MAX_ITEMS;
    this.defaultTtlMs = (Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : DEFAULT_TTL_SECONDS) * 1000;
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    // Recência (LRU): reinsere para mover a chave para o fim da ordem de iteração.
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    // Garante que uma chave reescrita vá para o fim (mais recente).
    this.store.delete(key);

    const ttlMs = ttlSeconds && ttlSeconds > 0 ? ttlSeconds * 1000 : this.defaultTtlMs;
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });

    // Evicção LRU: remove as entradas mais antigas até voltar ao limite.
    while (this.store.size > this.maxItems) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey === undefined) break;
      this.store.delete(oldestKey);
    }
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}
