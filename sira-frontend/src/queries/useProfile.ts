import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/services/api';
import { queryKeys } from './keys';

/**
 * Perfil do usuário no servidor. Fonte única de verdade dos dados de perfil.
 *
 * `useSessionProfile` consome esta query e mantém um espelho local editável
 * (`profileData`) que `Profile` e `Onboarding` mutam durante a edição.
 */
export const useProfile = (enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
    enabled,
  });
