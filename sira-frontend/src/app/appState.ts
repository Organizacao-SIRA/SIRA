import { DEFAULT_LOCALE } from '../i18n/locales';
import type { CatalogItem, ProfileData } from '../types';

export const SCREEN_SCROLL_KEYS: Record<string, string> = {
  results: '@sira:resultsScrollY',
  catalog: '@sira:catalogScrollY',
  favorites: '@sira:favoritesScrollY',
};

export const RESET_SCROLL_SCREENS = ['details'];
export const AUTH_SCREENS = ['login', 'register', 'onboarding', 'forgot-password', 'reset-password'];
export const PUBLIC_SCREENS = ['register', 'forgot-password', 'reset-password'];
export const SCREENS_WITHOUT_SIDEBAR = new Set(AUTH_SCREENS);

export type SearchSectionScreen = 'home' | 'results' | 'details';
export type SearchDetailOrigin = 'home' | 'results';
export type CatalogSectionScreen = 'catalog' | 'details';
export type FavoritesSectionScreen = 'favorites' | 'details';

const isSearchSectionScreen = (screen: string): screen is SearchSectionScreen =>
  screen === 'home' || screen === 'results' || screen === 'details';

const isSearchDetailOrigin = (screen: string): screen is SearchDetailOrigin =>
  screen === 'home' || screen === 'results';

const isCatalogSectionScreen = (screen: string): screen is CatalogSectionScreen =>
  screen === 'catalog' || screen === 'details';

const isFavoritesSectionScreen = (screen: string): screen is FavoritesSectionScreen =>
  screen === 'favorites' || screen === 'details';

export const readLastSearchScreen = (): SearchSectionScreen => {
  const stored = sessionStorage.getItem('@sira:lastSearchScreen');
  return stored && isSearchSectionScreen(stored) ? stored : 'home';
};

export const readSearchDetailOrigin = (): SearchDetailOrigin => {
  const stored = sessionStorage.getItem('@sira:searchDetailOrigin');
  return stored && isSearchDetailOrigin(stored) ? stored : 'results';
};

export const readLastCatalogScreen = (): CatalogSectionScreen => {
  const stored = sessionStorage.getItem('@sira:lastCatalogScreen');
  return stored && isCatalogSectionScreen(stored) ? stored : 'catalog';
};

export const readLastFavoritesScreen = (): FavoritesSectionScreen => {
  const stored = sessionStorage.getItem('@sira:lastFavoritesScreen');
  return stored && isFavoritesSectionScreen(stored) ? stored : 'favorites';
};

export const readCatalogItemArray = (key: string): CatalogItem[] => {
  const saved = sessionStorage.getItem(key);
  return saved ? JSON.parse(saved) as CatalogItem[] : [];
};

export const readCatalogItem = (key: string): CatalogItem | null => {
  const saved = sessionStorage.getItem(key);
  return saved ? JSON.parse(saved) as CatalogItem : null;
};

export const createEmptyProfileData = (): ProfileData => ({
  name: '',
  email: '',
  course: '',
  educationLevel: 'Graduação',
  mainArea: '',
  subAreas: '',
  languages: ['Português'],
  materialLevels: ['Intermediário'],
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
