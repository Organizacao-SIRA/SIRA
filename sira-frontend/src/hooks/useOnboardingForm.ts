import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { completeOnboarding } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { OnboardingFormData, StepFieldErrors } from '../types/onboarding';
import { ONBOARDING_STEPS } from '../types/onboarding';
import type { UserProfile, ProfileData } from '../types';

const DRAFT_KEY = '@sira:onboardingDraft';
const STEP_KEY = '@sira:onboardingStep';

const DEFAULT_FORM: OnboardingFormData = {
  course: '',
  educationLevel: 'Graduação',
  mainArea: '',
  subAreas: '',
  interests: [],
  languages: ['Português'],
  materialLevels: ['Intermediário'],
  wantsBooks: true,
  wantsArticles: true,
  academicGoal: '',
};

const readDraft = (): Partial<OnboardingFormData> | null => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const readStep = (max: number): number => {
  const raw = sessionStorage.getItem(STEP_KEY);
  const parsed = raw ? parseInt(raw, 10) : 0;
  if (Number.isNaN(parsed)) return 0;
  return Math.min(Math.max(parsed, 0), max);
};

const hydrate = (initial: Partial<OnboardingFormData> | undefined): OnboardingFormData => {
  const draft = readDraft();
  const source = { ...DEFAULT_FORM, ...(initial || {}), ...(draft || {}) };
  return {
    course: source.course || '',
    educationLevel: source.educationLevel || 'Graduação',
    mainArea: source.mainArea || '',
    subAreas: source.subAreas || '',
    interests: Array.isArray(source.interests) ? source.interests : [],
    languages: source.languages?.length ? source.languages : ['Português'],
    materialLevels: source.materialLevels?.length ? source.materialLevels : ['Intermediário'],
    wantsBooks: source.wantsBooks ?? true,
    wantsArticles: source.wantsArticles ?? true,
    academicGoal: source.academicGoal || '',
  };
};

interface UseOnboardingFormParams {
  initialData?: ProfileData;
  onSuccess: (profile: UserProfile) => void;
}

export function useOnboardingForm({ initialData, onSuccess }: UseOnboardingFormParams) {
  const { updateUser } = useAuth();
  const maxStep = ONBOARDING_STEPS.length - 1;

  const [data, setData] = useState<OnboardingFormData>(() => hydrate(initialData));
  const [step, setStep] = useState<number>(() => readStep(maxStep));
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const hydratedFromProps = useRef(false);
  useEffect(() => {
    if (!initialData || hydratedFromProps.current) return;
    if (initialData.course || initialData.mainArea || initialData.interests?.length) {
      setData((prev) => ({ ...prev, ...initialData }));
      hydratedFromProps.current = true;
    }
  }, [initialData]);

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    sessionStorage.setItem(STEP_KEY, String(step));
  }, [step]);

  const setField = useCallback(<K extends keyof OnboardingFormData>(field: K, value: OnboardingFormData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleArrayField = useCallback(
    <K extends 'interests' | 'languages' | 'materialLevels'>(field: K, value: string) => {
      setData((prev) => {
        const current = prev[field];
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [field]: next };
      });
    },
    [],
  );

  const stepErrors = useMemo<StepFieldErrors[]>(() => {
    const errors: StepFieldErrors[] = ONBOARDING_STEPS.map(() => ({}));

    if (!data.course.trim() || data.course.trim().length < 2) {
      errors[1].course = 'Informe o curso (mínimo 2 caracteres).';
    }
    if (!data.mainArea.trim()) {
      errors[1].mainArea = 'Selecione a área principal.';
    }

    if (data.interests.length < 3) {
      errors[2].interests = 'Selecione pelo menos 3 áreas de interesse.';
    }

    if (data.languages.length === 0) {
      errors[3].languages = 'Selecione pelo menos 1 idioma.';
    }
    if (data.materialLevels.length === 0) {
      errors[3].materialLevels = 'Selecione pelo menos 1 nível de material.';
    }
    if (!data.wantsBooks && !data.wantsArticles) {
      errors[3].wantsBooks = 'Selecione pelo menos um formato (livros ou artigos).';
    }

    return errors;
  }, [data]);

  const isStepValid = useCallback(
    (index: number) => Object.keys(stepErrors[index] || {}).length === 0,
    [stepErrors],
  );

  const canAdvance = useMemo(() => isStepValid(step), [isStepValid, step]);

  const next = useCallback(() => {
    if (!isStepValid(step)) return;
    setStep((prev) => Math.min(prev + 1, maxStep));
  }, [step, isStepValid, maxStep]);

  const back = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goTo = useCallback(
    (target: number) => {
      const safe = Math.min(Math.max(target, 0), maxStep);
      setStep(safe);
    },
    [maxStep],
  );

  const submit = useCallback(async () => {
    for (let i = 1; i <= 3; i += 1) {
      if (!isStepValid(i)) {
        setStep(i);
        return;
      }
    }

    setIsSaving(true);
    setSubmitError('');

    try {
      const profile = await completeOnboarding({
        course: data.course.trim(),
        educationLevel: data.educationLevel,
        mainArea: data.mainArea,
        subAreas: data.subAreas.trim() || undefined,
        languages: data.languages,
        materialLevels: data.materialLevels,
        wantsBooks: data.wantsBooks,
        wantsArticles: data.wantsArticles,
        interests: data.interests,
        academicGoal: data.academicGoal || undefined,
      });

      updateUser({ hasCompletedOnboarding: true });
      sessionStorage.removeItem(DRAFT_KEY);
      sessionStorage.removeItem(STEP_KEY);
      onSuccess(profile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar preferências. Tente novamente.';
      setSubmitError(message);
    } finally {
      setIsSaving(false);
    }
  }, [data, isStepValid, updateUser, onSuccess]);

  return {
    data,
    setField,
    toggleArrayField,
    step,
    next,
    back,
    goTo,
    canAdvance,
    isStepValid,
    stepErrors,
    isSaving,
    submitError,
    submit,
    totalSteps: ONBOARDING_STEPS.length,
  };
}
