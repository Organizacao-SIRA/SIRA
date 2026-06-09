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
  shortLabelKey: string;
};

export const ONBOARDING_STEPS: OnboardingStepMeta[] = [
  { id: 'welcome',              labelKey: 'steps.welcome.label',            shortLabelKey: 'steps.welcome.short' },
  { id: 'academic-profile',     labelKey: 'steps.academicProfile.label',    shortLabelKey: 'steps.academicProfile.short' },
  { id: 'interest-areas',       labelKey: 'steps.interestAreas.label',      shortLabelKey: 'steps.interestAreas.short' },
  { id: 'content-preferences',  labelKey: 'steps.contentPreferences.label', shortLabelKey: 'steps.contentPreferences.short' },
  { id: 'academic-goal',        labelKey: 'steps.academicGoal.label',       shortLabelKey: 'steps.academicGoal.short' },
  { id: 'review',               labelKey: 'steps.review.label',             shortLabelKey: 'steps.review.short' },
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
  'content-preferences': ['languages', 'materialLevels', 'wantsBooks', 'wantsArticles', 'wantsOpenAccessOnly'],
  'academic-goal': ['academicGoal'],
  'review': [],
};
