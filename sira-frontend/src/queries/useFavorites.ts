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
  previous: Set<string> | undefined;
}

/**
 * Conjunto de favoritos do usuário + ações de alternância.
 *
 * Substitui:
 *  - o carregamento manual de `favoriteIds` em `useSessionProfile`;
 *  - o optimistic-update-com-rollback escrito à mão em `App.tsx`.
 *
 * O `useMutation` com `onMutate`/`onError` faz exatamente o feedback imediato
 * com reversão em caso de falha, agora de forma declarativa.
 */
export const useFavorites = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation('common');

  const { data: favoriteIds } = useQuery({
    queryKey: queryKeys.favoriteIds,
    queryFn: async () => new Set(await fetchFavoriteIds()),
    enabled: isAuthenticated,
  });

  const ids = favoriteIds ?? EMPTY_IDS;

  const { mutateAsync } = useMutation<unknown, Error, ToggleVars, ToggleContext>({
    mutationFn: ({ item, isFav }) => (isFav ? removeFavoriteApi(item.id) : addFavorite(item)),
    onMutate: async ({ item, isFav }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favoriteIds });
      const previous = queryClient.getQueryData<Set<string>>(queryKeys.favoriteIds);
      queryClient.setQueryData<Set<string>>(queryKeys.favoriteIds, (old) => {
        const next = new Set(old);
        if (isFav) next.delete(item.id);
        else next.add(item.id);
        return next;
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

  return { favoriteIds: ids, isFavorite, toggleFavorite };
};
