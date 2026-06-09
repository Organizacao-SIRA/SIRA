import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { completeOnboarding, updateProfile } from '@/services/api';
import type {
  UserProfile,
  CompleteOnboardingPayload,
  UpdateProfilePayload,
} from '@/types';
import { queryKeys } from './keys';

/**
 * Mutations do perfil.
 *
 * A query `['profile']` é a fonte única de verdade do perfil (ver `useProfile`),
 * e `useSessionProfile` espelha esse cache no estado editável da tela. Por isso,
 * **toda** escrita que retorna o `UserProfile` atualizado precisa gravá-lo de
 * volta no cache — senão `useSessionProfile` reidrata a tela com o snapshot
 * antigo e sobrescreve os dados recém-salvos (ex.: o perfil "some" depois do
 * onboarding até dar F5).
 *
 * `useSyncProfileCache` concentra essa regra num único ponto; cada mutation só
 * declara sua chamada de API e delega o `onSuccess` a ela. Fluxos que já chamam
 * a API por conta própria (ex.: o modal de avatar) usam `useSyncProfileCache`
 * diretamente com o perfil retornado.
 */
export const useSyncProfileCache = () => {
  const queryClient = useQueryClient();
  return useCallback(
    (profile: UserProfile) => {
      queryClient.setQueryData(queryKeys.profile, profile);
    },
    [queryClient],
  );
};

export const useCompleteOnboarding = () => {
  const syncProfileCache = useSyncProfileCache();
  return useMutation<UserProfile, Error, CompleteOnboardingPayload>({
    mutationFn: completeOnboarding,
    onSuccess: syncProfileCache,
  });
};

export const useUpdateProfile = () => {
  const syncProfileCache = useSyncProfileCache();
  return useMutation<UserProfile, Error, UpdateProfilePayload>({
    mutationFn: updateProfile,
    onSuccess: syncProfileCache,
  });
};
