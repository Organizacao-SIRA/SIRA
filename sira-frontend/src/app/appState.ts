import { DEFAULT_LOCALE } from '../i18n/locales';
import { DEFAULT_EDUCATION_LEVEL, DEFAULT_LANGUAGES, DEFAULT_MATERIAL_LEVELS } from '../i18n/preferenceValues';
import type { ProfileData } from '../types';

export const createEmptyProfileData = (): ProfileData => ({
  name: '',
  email: '',
  course: '',
  educationLevel: DEFAULT_EDUCATION_LEVEL,
  mainArea: '',
  subAreas: '',
  languages: [...DEFAULT_LANGUAGES],
  materialLevels: [...DEFAULT_MATERIAL_LEVELS],
  wantsBooks: true,
  wantsArticles: true,
  wantsOpenAccessOnly: false,
  interests: [],
  academicGoal: '',
  avatarUrl: null,
  uiLocale: DEFAULT_LOCALE,
  hasCompletedOnboarding: false,
  onboardingCompletedAt: null,
});
