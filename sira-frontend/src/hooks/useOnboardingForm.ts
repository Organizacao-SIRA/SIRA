import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '../toast';
import { useAuth } from '../contexts/AuthContext';
import { useCompleteOnboarding } from '../queries/useProfileMutations';
import { DEFAULT_EDUCATION_LEVEL, DEFAULT_LANGUAGES, DEFAULT_MATERIAL_LEVELS } from '../i18n/preferenceValues';
import type { OnboardingFormData, StepFieldErrors } from '../types/onboarding';
import { ONBOARDING_STEPS } from '../types/onboarding';
import type { UserProfile, ProfileData } from '../types';

const DRAFT_KEY = '@sira:onboardingDraft';
const STEP_KEY = '@sira:onboardingStep';

const DEFAULT_FORM: OnboardingFormData = {
  course: '',
  educationLevel: DEFAULT_EDUCATION_LEVEL,
  mainArea: '',
  subAreas: '',
  interests: [],
  languages: [...DEFAULT_LANGUAGES],
  materialLevels: [...DEFAULT_MATERIAL_LEVELS],
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
    educationLevel: source.educationLevel || DEFAULT_EDUCATION_LEVEL,
    mainArea: source.mainArea || '',
    subAreas: source.subAreas || '',
    interests: Array.isArray(source.interests) ? source.interests : [],
    languages: source.languages?.length ? source.languages : [...DEFAULT_LANGUAGES],
    materialLevels: source.materialLevels?.length ? source.materialLevels : [...DEFAULT_MATERIAL_LEVELS],
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
  const { t } = useTranslation('onboarding');
  const { updateUser } = useAuth();
  const { mutateAsync: completeOnboardingAsync, isPending: isSaving } = useCompleteOnboarding();
  const maxStep = ONBOARDING_STEPS.length - 1;

  const [data, setData] = useState<OnboardingFormData>(() => hydrate(initialData));
  const [step, setStep] = useState<number>(() => readStep(maxStep));

  const hydratedFromProps = useRef(false);
  useEffect(() => {
    if (!initialData || hydratedFromProps.current) return;
    if (initialData.course || initialData.mainArea || initialData.interests?.length) {
      queueMicrotask(() => {
        if (hydratedFromProps.current) return;
        setData((prev) => ({ ...prev, ...initialData }));
        hydratedFromProps.current = true;
      });
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
      errors[1].course = t('validation.course');
    }
    if (!data.mainArea.trim()) {
      errors[1].mainArea = t('validation.mainArea');
    }

    if (data.interests.length < 3) {
      errors[2].interests = t('validation.interests');
    }

    if (data.languages.length === 0) {
      errors[3].languages = t('validation.languages');
    }
    if (data.materialLevels.length === 0) {
      errors[3].materialLevels = t('validation.materialLevels');
    }
    if (!data.wantsBooks && !data.wantsArticles) {
      errors[3].wantsBooks = t('validation.formats');
    }

    return errors;
  }, [data, t]);

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

    try {
      const profile = await completeOnboardingAsync({
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
      toast.error(err instanceof Error ? err.message : t('validation.submit'));
    }
  }, [data, isStepValid, updateUser, onSuccess, t, completeOnboardingAsync]);

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
    submit,
    totalSteps: ONBOARDING_STEPS.length,
  };
}
