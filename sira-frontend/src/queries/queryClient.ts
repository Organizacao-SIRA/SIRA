import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

/**
 * Cliente único do TanStack Query.
 *
 * Substitui a orquestração manual de fetch/cache que vivia em `useSessionProfile`,
 * `useCatalog` (via `createSessionCache`) e nos `useEffect` de espelhamento em
 * `sessionStorage` espalhados pela app.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 min "fresco" antes de revalidar
      gcTime: 15 * 60_000, // mantém em cache 15 min após o último uso
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Persistência em `sessionStorage` — replica o comportamento "sobreviver ao F5"
 * que antes era feito à mão. O logout limpa as chaves `@sira:*` (ver AuthProvider),
 * o que inclui este cache.
 */
export const queryPersister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
  key: '@sira:query-cache',
});
