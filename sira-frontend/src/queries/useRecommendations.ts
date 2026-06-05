import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAiRecommendations, refreshAiRecommendations } from '@/services/api';
import type { RecommendationsResponse } from '@/types';
import { queryKeys } from './keys';

/**
 * Recomendações de IA do usuário. Só busca quando autenticado (`enabled`).
 * Substitui o estado manual + `queueMicrotask` de `AiRecommendations`.
 */
export const useRecommendations = (enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.recommendations,
    queryFn: getAiRecommendations,
    enabled,
  });

/**
 * Regeneração explícita (ação do usuário). Em caso de sucesso, grava o resultado
 * direto no cache da query de recomendações.
 */
export const useRefreshRecommendations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: refreshAiRecommendations,
    onSuccess: (data: RecommendationsResponse) => {
      queryClient.setQueryData(queryKeys.recommendations, data);
    },
  });
};
