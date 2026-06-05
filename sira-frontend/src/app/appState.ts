import { DEFAULT_LOCALE } from '../i18n/locales';
import { DEFAULT_EDUCATION_LEVEL, DEFAULT_LANGUAGES, DEFAULT_MATERIAL_LEVELS } from '../i18n/preferenceValues';
import type { CatalogItem, ProfileData } from '../types';

export const readSessionJson = <T,>(key: string, fallback: T): T => {
  const saved = sessionStorage.getItem(key);
  if (!saved) return fallback;

  try {
    return JSON.parse(saved) as T;
  } catch {
    sessionStorage.removeItem(key);
    return fallback;
  }
};

export const readCatalogItemArray = (key: string): CatalogItem[] => {
  return readSessionJson<CatalogItem[]>(key, []);
};

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
