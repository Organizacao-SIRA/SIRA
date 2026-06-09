import type { SearchFilters } from '@/types';
import type { FavoriteTypeFilter } from '@/services/api';

/**
 * Fonte única de verdade das query keys.
 *
 * Centralizar evita typos e facilita invalidação (`queryClient.invalidateQueries`)
 * por prefixo — ex.: invalidar `['favorites']` atinge tanto os ids quanto as páginas.
 */
export const queryKeys = {
  profile: ['profile'] as const,
  preferenceOptions: ['preference-options'] as const,

  favorites: ['favorites'] as const,
  favoriteIds: ['favorites', 'ids'] as const,
  favoritesList: (page: number, type: FavoriteTypeFilter) =>
    ['favorites', 'list', { page, type }] as const,

  material: (id: string | undefined) => ['material', id] as const,

  catalogSearch: (query: string, category: string, page: number, filters: SearchFilters) =>
    ['catalog', { query, category, page, filters }] as const,
} as const;
