import { useQuery } from '@tanstack/react-query';
import { getMaterialById } from '@/services/api';
import type { CatalogItem } from '@/types';
import { queryKeys } from './keys';

/**
 * Material da tela de detalhes, buscado por ID.
 *
 * Em navegação interna, o item já vem via route state e é passado como
 * `initialData` (render instantâneo, sem fetch). Em deep-link/F5 (sem state),
 * busca `GET /materials/:id`. `data === null` significa MATERIAL_NOT_FOUND.
 */
export const useMaterial = (id: string | undefined, initialData?: CatalogItem) =>
  useQuery({
    queryKey: queryKeys.material(id),
    queryFn: () => getMaterialById(id as string),
    enabled: !!id,
    initialData,
  });
