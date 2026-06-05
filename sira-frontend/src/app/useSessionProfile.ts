import { useCallback, useEffect, useState } from 'react';
import { getProfile } from '../services/api';
import { DEFAULT_LOCALE } from '../i18n/locales';
import { DEFAULT_EDUCATION_LEVEL, DEFAULT_LANGUAGES, DEFAULT_MATERIAL_LEVELS } from '../i18n/preferenceValues';
import type { AuthUser, ProfileData } from '../types';
import { createEmptyProfileData } from './appState';

interface UseSessionProfileParams {
  isAuthenticated: boolean;
  user: AuthUser | null;
  updateUser: (userData: Partial<AuthUser>) => void;
  onLogoutReset: () => void;
}

export const useSessionProfile = ({
  isAuthenticated,
  user,
  updateUser,
  onLogoutReset,
}: UseSessionProfileParams) => {
  const [isProfileLoading, setIsProfileLoading] = useState(isAuthenticated);
  const [profileError, setProfileError] = useState<string | null>(null);
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

  const loadProfile = useCallback(async () => {
    try {
      const data = await getProfile();
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
      setProfileError(null);
      if (data.avatarUrl !== undefined || data.uiLocale !== undefined) {
        updateUser({
          ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
          ...(data.uiLocale !== undefined ? { uiLocale: data.uiLocale } : {}),
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      const message = error instanceof Error ? error.message : 'Erro ao carregar perfil';
      setProfileError(message);
    }
  }, [updateUser]);

  const loadSessionData = useCallback(() => {
    setIsProfileLoading(true);
    setProfileError(null);
    loadProfile().finally(() => {
      setIsProfileLoading(false);
    });
  }, [loadProfile]);

  useEffect(() => {
    let isActive = true;

    queueMicrotask(() => {
      if (!isActive) return;

      if (isAuthenticated && authUserId) {
        setProfileData(prev => ({
          ...prev,
          name: authUserName || prev.name,
          email: authUserEmail || prev.email,
          hasCompletedOnboarding: authUserHasCompletedOnboarding ?? prev.hasCompletedOnboarding,
          uiLocale: authUserUiLocale ?? prev.uiLocale,
        }));

        loadSessionData();
      } else if (!isAuthenticated) {
        setProfileData(createEmptyProfileData());
        setIsProfileLoading(false);
        setProfileError(null);
        onLogoutReset();
      }
    });

    return () => {
      isActive = false;
    };
  }, [
    isAuthenticated,
    authUserEmail,
    authUserHasCompletedOnboarding,
    authUserId,
    authUserName,
    authUserUiLocale,
    loadSessionData,
    onLogoutReset,
  ]);

  return {
    isProfileLoading,
    profileError,
    profileData,
    setProfileData,
    loadSessionData,
  };
};
