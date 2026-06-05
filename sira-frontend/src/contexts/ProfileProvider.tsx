import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useSessionProfile } from '../app/useSessionProfile';
import { ProfileContext } from './ProfileContext';

/**
 * Espelho editável do perfil (`profileData`/`setProfileData`) consumido por
 * `Profile` e `Onboarding`. Monta dentro da área autenticada; o fetch/cache
 * fica no TanStack Query (`useProfile`).
 */
export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user, updateUser } = useAuth();
  const profile = useSessionProfile({ isAuthenticated, user, updateUser });
  return <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>;
};
