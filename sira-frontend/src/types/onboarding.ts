import type { AcademicPreferences } from '../domain/academicPreferences';

// Estado do formulário de onboarding = contrato completo de preferências
// (onboarding e Configurações cobrem o mesmo conjunto de campos).
export type OnboardingFormData = AcademicPreferences;

export type OnboardingStepId =
  | 'welcome'
  | 'academic-profile'
  | 'interest-areas'
  | 'content-preferences'
  | 'academic-goal'
  | 'review';

export type OnboardingStepMeta = {
  id: OnboardingStepId;
  labelKey: string;
};

export const ONBOARDING_STEPS: OnboardingStepMeta[] = [
  { id: 'welcome',              labelKey: 'steps.welcome.label' },
  { id: 'academic-profile',     labelKey: 'steps.academicProfile.label' },
  { id: 'interest-areas',       labelKey: 'steps.interestAreas.label' },
  { id: 'content-preferences',  labelKey: 'steps.contentPreferences.label' },
  { id: 'academic-goal',        labelKey: 'steps.academicGoal.label' },
  { id: 'review',               labelKey: 'steps.review.label' },
];

export type StepFieldErrors = Partial<Record<keyof OnboardingFormData, string>>;

/**
 * Campos de preferência validados por cada step. Mapeia o `id` do step (não o
 * índice) para os campos do contrato — assim a validação acompanha qualquer
 * reordenação/inserção de steps sem números mágicos espalhados pelo código.
 */
export const ONBOARDING_STEP_FIELDS: Record<OnboardingStepId, (keyof OnboardingFormData)[]> = {
  'welcome': [],
  'academic-profile': ['course', 'educationLevel', 'mainArea', 'subAreas'],
  'interest-areas': ['interests'],
  'content-preferences': ['languages', 'materialLevels', 'wantsBooks', 'wantsArticles'],
  'academic-goal': ['academicGoal'],
  'review': [],
};
