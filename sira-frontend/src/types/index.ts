import type { UiLocale } from '../i18n/locales';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  uiLocale?: UiLocale;
}

export type PreferenceTopic = {
  id: string;
  label: string;
  description?: string;
};

export type PreferenceOptions = {
  topics: PreferenceTopic[];
  educationLevels: string[];
  languages: string[];
  materialLevels: string[];
  academicGoals: string[];
};

export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  course: string | null;
  educationLevel: string | null;
  mainArea: string | null;
  subAreas: string | null;
  languages: string[];
  materialLevels: string[];
  wantsBooks: boolean;
  wantsArticles: boolean;
  wantsOpenAccessOnly: boolean;
  interests: string[];
  academicGoal: string | null;
  avatarUrl: string | null;
  uiLocale: UiLocale;
  onboardingCompletedAt: string | null;
  hasCompletedOnboarding: boolean;
};

export type CompleteOnboardingPayload = {
  course: string;
  educationLevel: string;
  mainArea: string;
  subAreas?: string;
  languages: string[];
  materialLevels: string[];
  wantsBooks: boolean;
  wantsArticles: boolean;
  interests: string[];
  academicGoal?: string;
};

export type ProfileData = {
  name: string;
  email: string;
  course: string;
  educationLevel: string;
  mainArea: string;
  subAreas: string;
  languages: string[];
  materialLevels: string[];
  wantsBooks: boolean;
  wantsArticles: boolean;
  wantsOpenAccessOnly: boolean;
  interests: string[];
  academicGoal: string;
  avatarUrl: string | null;
  uiLocale: UiLocale;
  hasCompletedOnboarding: boolean;
  onboardingCompletedAt: string | null;
};

export type SearchFilters = {
  types: ('book' | 'article')[];
  area: string | null;
  openAccessOnly: boolean;
  yearFrom: number | null;
};

export type CatalogItem = {
  id: string;
  type: 'book' | 'article';
  title: string;
  authors: string;
  year: string;
  source: string;
  provider?: string;
  relevance: number;
  abstract?: string;
  image?: string | null;
  url?: string;
  isOpenAccess?: boolean;
  thematicArea?: string;
  doi?: string;
  isbn?: string;
  level?: string;
  aiJustification?: string | null;
  aiExplanation?: string | null;
  keywords?: string[];
};
