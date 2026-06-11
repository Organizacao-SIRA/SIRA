import type { UiLocale } from '../i18n/locales';
import type { AcademicPreferences } from '../domain/academicPreferences';

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
  currentWork: string | null;
  languages: string[];
  materialLevels: string[];
  wantsBooks: boolean;
  wantsArticles: boolean;
  interests: string[];
  academicGoal: string | null;
  avatarUrl: string | null;
  uiLocale: UiLocale;
  onboardingCompletedAt: string | null;
  hasCompletedOnboarding: boolean;
};

// Payload enviado ao concluir o onboarding. Deriva do contrato de preferências;
// `subAreas`/`academicGoal` são opcionais (o cliente envia `undefined` quando vazios).
export type CompleteOnboardingPayload =
  Omit<AcademicPreferences, 'subAreas' | 'academicGoal' | 'currentWork'> & {
    subAreas?: string;
    academicGoal?: string;
    currentWork?: string;
  };

// Espelho editável do perfil: as preferências acadêmicas (contrato) + os campos
// de conta/sessão que não pertencem ao onboarding.
export type ProfileData = AcademicPreferences & {
  name: string;
  email: string;
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

// Atualização parcial do perfil: qualquer preferência acadêmica (contrato) +
// nome e idioma da UI. Deriva do contrato — novos campos de preferência entram
// automaticamente, sem precisar manter esta lista à mão.
export type UpdateProfilePayload = Partial<AcademicPreferences & {
  name: string;
  uiLocale: UiLocale;
}>;

export type RecommendationsResponse = {
  recommendations: CatalogItem[];
  basedOn: { favorites: number; searches: number; preferences: boolean };
  generatedAt: string;
  coldStart?: boolean;
};
