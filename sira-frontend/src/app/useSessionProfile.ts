import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_LOCALE } from '../i18n/locales';
import { DEFAULT_EDUCATION_LEVEL, DEFAULT_LANGUAGES, DEFAULT_MATERIAL_LEVELS } from '../i18n/preferenceValues';
import { useProfile } from '../queries/useProfile';
import type { AuthUser, ProfileData } from '../types';
import { createEmptyProfileData } from './appState';

interface UseSessionProfileParams {
  isAuthenticated: boolean;
  user: AuthUser | null;
  updateUser: (userData: Partial<AuthUser>) => void;
}

/**
 * Adaptador entre a query de perfil (`useProfile`) e o espelho local editável
 * (`profileData`) consumido por `Profile`/`Onboarding`.
 *
 * O fetch, o cache e a persistência ficam no TanStack Query; aqui só sincronizamos
 * o resultado do servidor com o estado editável e semeamos a partir do `user`.
 */
export const useSessionProfile = ({
  isAuthenticated,
  user,
  updateUser,
}: UseSessionProfileParams) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    ...createEmptyProfileData(),
    name: user?.name ?? '',
    email: user?.email ?? '',
    avatarUrl: user?.avatarUrl ?? null,
    uiLocale: user?.uiLocale ?? DEFAULT_LOCALE,
    hasCompletedOnboarding: user?.hasCompletedOnboarding ?? false,
  });

  const authUserId = user?.id;
  const authUserName = user?.name;
  const authUserEmail = user?.email;
  const authUserHasCompletedOnboarding = user?.hasCompletedOnboarding;
  const authUserUiLocale = user?.uiLocale;

  const profileQuery = useProfile(isAuthenticated && !!authUserId);
  const profileQueryData = profileQuery.data;

  // Semeia o espelho local com os campos já conhecidos do `user` (antes da resposta do servidor).
  // O `queueMicrotask` é o escape-hatch do projeto para a regra react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!isAuthenticated || !authUserId) return;
    let isActive = true;
    queueMicrotask(() => {
      if (!isActive) return;
      setProfileData(prev => ({
        ...prev,
        name: authUserName || prev.name,
        email: authUserEmail || prev.email,
        hasCompletedOnboarding: authUserHasCompletedOnboarding ?? prev.hasCompletedOnboarding,
        uiLocale: authUserUiLocale ?? prev.uiLocale,
      }));
    });
    return () => { isActive = false; };
  }, [isAuthenticated, authUserId, authUserName, authUserEmail, authUserHasCompletedOnboarding, authUserUiLocale]);

  // Mescla o perfil do servidor no espelho local quando a query responde.
  useEffect(() => {
    const data = profileQueryData;
    if (!data) return;
    let isActive = true;

    queueMicrotask(() => {
      if (!isActive) return;
      setProfileData(prev => ({
        ...prev,
        name: data.name || prev.name,
        email: data.email || prev.email,
        course: data.course || '',
        educationLevel: data.educationLevel || DEFAULT_EDUCATION_LEVEL,
        mainArea: data.mainArea || '',
        subAreas: data.subAreas || '',
        languages: data.languages?.length ? data.languages : [...DEFAULT_LANGUAGES],
        materialLevels: data.materialLevels?.length ? data.materialLevels : [...DEFAULT_MATERIAL_LEVELS],
        wantsBooks: data.wantsBooks ?? true,
        wantsArticles: data.wantsArticles ?? true,
        wantsOpenAccessOnly: data.wantsOpenAccessOnly ?? false,
        interests: data.interests || [],
        academicGoal: data.academicGoal || '',
        avatarUrl: data.avatarUrl ?? null,
        uiLocale: data.uiLocale ?? DEFAULT_LOCALE,
        hasCompletedOnboarding: data.hasCompletedOnboarding ?? false,
        onboardingCompletedAt: data.onboardingCompletedAt || null,
      }));

      if (data.avatarUrl !== undefined || data.uiLocale !== undefined) {
        updateUser({
          ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
          ...(data.uiLocale !== undefined ? { uiLocale: data.uiLocale } : {}),
        });
      }
    });
    return () => { isActive = false; };
  }, [profileQueryData, updateUser]);

  // Logout: zera o espelho local (o provider desmonta ao sair da área autenticada).
  useEffect(() => {
    if (isAuthenticated) return;
    let isActive = true;
    queueMicrotask(() => {
      if (!isActive) return;
      setProfileData(createEmptyProfileData());
    });
    return () => { isActive = false; };
  }, [isAuthenticated]);

  const loadSessionData = useCallback(() => {
    void profileQuery.refetch();
  }, [profileQuery]);

  return {
    isProfileLoading: profileQuery.isLoading,
    profileError: profileQuery.error instanceof Error ? profileQuery.error.message : null,
    profileData,
    setProfileData,
    loadSessionData,
  };
};
