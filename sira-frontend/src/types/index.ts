import type { UiLocale } from '../i18n/locales';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  hasCompletedOnboarding?: boolean;
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

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken?: string;
  refreshToken?: string;
};

export type SearchResultsResponse = {
  items: CatalogItem[];
  total: number;
};

export type ChatSearchResponse = {
  aiMessage: string;
  results: CatalogItem[];
};

export type UpdateProfilePayload = Partial<
  Pick<
    ProfileData,
    | 'name'
    | 'course'
    | 'educationLevel'
    | 'mainArea'
    | 'subAreas'
    | 'languages'
    | 'materialLevels'
    | 'wantsBooks'
    | 'wantsArticles'
    | 'wantsOpenAccessOnly'
    | 'interests'
    | 'academicGoal'
    | 'uiLocale'
  >
>;

export type RecommendationsResponse = {
  recommendations: CatalogItem[];
  basedOn: { favorites: number; searches: number; preferences: boolean };
  generatedAt: string;
  coldStart?: boolean;
};
