export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
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
  interests: string[];
  academicGoal: string | null;
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
