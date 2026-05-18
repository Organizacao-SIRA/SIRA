export type OnboardingFormData = {
  course: string;
  educationLevel: string;
  mainArea: string;
  subAreas: string;
  interests: string[];
  languages: string[];
  materialLevels: string[];
  wantsBooks: boolean;
  wantsArticles: boolean;
  academicGoal: string;
};

export type OnboardingStepId =
  | 'welcome'
  | 'academic-profile'
  | 'interest-areas'
  | 'content-preferences'
  | 'academic-goal'
  | 'review';

export type OnboardingStepMeta = {
  id: OnboardingStepId;
  label: string;
  shortLabel: string;
};

export const ONBOARDING_STEPS: OnboardingStepMeta[] = [
  { id: 'welcome',              label: 'Boas-vindas',         shortLabel: 'Início'      },
  { id: 'academic-profile',     label: 'Perfil acadêmico',    shortLabel: 'Perfil'      },
  { id: 'interest-areas',       label: 'Áreas de interesse',  shortLabel: 'Interesses'  },
  { id: 'content-preferences',  label: 'Preferências',        shortLabel: 'Preferências'},
  { id: 'academic-goal',        label: 'Objetivo',            shortLabel: 'Objetivo'    },
  { id: 'review',               label: 'Revisão',             shortLabel: 'Revisão'     },
];

export type StepFieldErrors = Partial<Record<keyof OnboardingFormData, string>>;
