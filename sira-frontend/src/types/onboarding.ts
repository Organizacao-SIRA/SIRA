import type { AcademicPreferences } from '../domain/academicPreferences';

// Estado do formulário de onboarding. Deriva do contrato de preferências; hoje
// o onboarding ainda não coleta `wantsOpenAccessOnly` (só as Configurações).
export type OnboardingFormData = Omit<AcademicPreferences, 'wantsOpenAccessOnly'>;

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
