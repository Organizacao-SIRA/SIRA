import { DEFAULT_LOCALE } from '../i18n/locales';
import { createDefaultAcademicPreferences } from '../domain/academicPreferences';
import type { ProfileData } from '../types';

export const createEmptyProfileData = (): ProfileData => ({
  ...createDefaultAcademicPreferences(),
  name: '',
  email: '',
  avatarUrl: null,
  uiLocale: DEFAULT_LOCALE,
  hasCompletedOnboarding: false,
  onboardingCompletedAt: null,
});
