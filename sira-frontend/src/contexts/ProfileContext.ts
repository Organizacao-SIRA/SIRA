import { createContext, useContext } from 'react';
import type { useSessionProfile } from '../app/useSessionProfile';

export type ProfileContextValue = ReturnType<typeof useSessionProfile>;

export const ProfileContext = createContext<ProfileContextValue | null>(null);

export const useProfileContext = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfileContext precisa estar dentro de <ProfileProvider>');
  return ctx;
};
