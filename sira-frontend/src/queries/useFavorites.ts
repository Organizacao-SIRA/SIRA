import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { addFavorite, fetchFavoriteIds, removeFavoriteApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/toast';
import type { CatalogItem } from '@/types';
import { queryKeys } from './keys';

const EMPTY_IDS: ReadonlySet<string> = new Set();

interface ToggleVars {
  item: CatalogItem;
  isFav: boolean;
}

interface ToggleContext {
  previous: string[] | undefined;
}

/**
 * Conjunto de favoritos do usuário + ações de alternância.
 *
 * O cache guarda um `string[]` (serializável — sobrevive à persistência em
 * sessionStorage), e expomos um `Set` aos componentes via `select`. Guardar um
 * `Set` direto no cache quebraria no F5: `JSON.stringify(new Set())` vira `{}`.
 *
 * O `useMutation` com `onMutate`/`onError` faz o optimistic-update-com-rollback
 * de forma declarativa.
 */
export const useFavorites = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation('common');

  const { data: favoriteIds, isSuccess } = useQuery({
    queryKey: queryKeys.favoriteIds,
    queryFn: fetchFavoriteIds,
    enabled: isAuthenticated,
    // Defensivo: cache antigo/corrompido pode não ser um array iterável.
    select: (ids) => new Set(Array.isArray(ids) ? ids : []),
  });

  const ids = favoriteIds ?? EMPTY_IDS;
  // `true` quando o conjunto de IDs já é autoritativo (query resolvida). Permite
  // a consumidores decidir "0 favoritos" sem um fetch próprio — ex.: a tela de
  // Favoritos pula o skeleton quando já se sabe que a biblioteca está vazia.
  const favoritesLoaded = isSuccess;

  const { mutateAsync } = useMutation<unknown, Error, ToggleVars, ToggleContext>({
    mutationFn: ({ item, isFav }) => (isFav ? removeFavoriteApi(item.id) : addFavorite(item)),
    onMutate: async ({ item, isFav }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favoriteIds });
      const previous = queryClient.getQueryData<string[]>(queryKeys.favoriteIds);
      queryClient.setQueryData<string[]>(queryKeys.favoriteIds, (old) => {
        const current = Array.isArray(old) ? old : [];
        if (isFav) return current.filter(existing => existing !== item.id);
        return current.includes(item.id) ? current : [...current, item.id];
      });
      return { previous };
    },
    onError: (error, _vars, context) => {
      // Rollback para o estado anterior ao optimistic update.
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.favoriteIds, context.previous);
      }
      toast.error(
        t('errors.favoriteAlert', {
          message: error instanceof Error ? error.message : t('errors.unknownFavorite'),
        }),
      );
    },
    onSuccess: (_data, { isFav }) => {
      toast.success(isFav ? t('toast.favoriteRemoved') : t('toast.favoriteAdded'));
    },
  });

  const toggleFavorite = useCallback(
    async (item: CatalogItem): Promise<boolean> => {
      const isFav = ids.has(item.id);
      try {
        await mutateAsync({ item, isFav });
        return true;
      } catch {
        return false;
      }
    },
    [ids, mutateAsync],
  );

  const isFavorite = useCallback((id: string) => ids.has(id), [ids]);

  return { favoriteIds: ids, favoritesLoaded, isFavorite, toggleFavorite };
};
