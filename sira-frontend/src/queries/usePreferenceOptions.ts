import { useQuery } from '@tanstack/react-query';
import { getPreferenceOptions } from '@/services/api';
import { queryKeys } from './keys';

/**
 * Opções de preferência (tópicos, idiomas, níveis, metas) vindas do backend.
 *
 * Fonte única: antes era buscado separadamente em `Profile`, `useCatalog` e
 * `Onboarding`. Como praticamente não mudam durante a sessão, usam `staleTime`
 * infinito — o cache do Query dedupa as três chamadas em uma só.
 */
export const usePreferenceOptions = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: queryKeys.preferenceOptions,
    queryFn: getPreferenceOptions,
    staleTime: Infinity,
    enabled: options?.enabled ?? true,
  });
