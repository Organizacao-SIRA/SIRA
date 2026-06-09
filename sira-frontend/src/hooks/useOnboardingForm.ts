import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '../toast';
import { useAuth } from '../contexts/AuthContext';
import { useCompleteOnboarding } from '../queries/useProfileMutations';
import { DEFAULT_EDUCATION_LEVEL, DEFAULT_LANGUAGES, DEFAULT_MATERIAL_LEVELS } from '../i18n/preferenceValues';
import { MIN_INTERESTS, onboardingPreferencesSchema } from '../domain/academicPreferences';
import type { OnboardingFormData, StepFieldErrors } from '../types/onboarding';
import { ONBOARDING_STEPS, ONBOARDING_STEP_FIELDS } from '../types/onboarding';
import type { UserProfile, ProfileData } from '../types';

/** Campo do formulário → chave i18n da mensagem de validação. */
const VALIDATION_KEY_BY_FIELD: Partial<Record<keyof OnboardingFormData, string>> = {
  course: 'validation.course',
  mainArea: 'validation.mainArea',
  interests: 'validation.interests',
  languages: 'validation.languages',
  materialLevels: 'validation.materialLevels',
  wantsBooks: 'validation.formats', // refine "ao menos um formato" reporta em wantsBooks
};

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
    // Valida pelo schema do contrato e mapeia cada issue para a mensagem i18n
    // do campo correspondente.
    const result = onboardingPreferencesSchema.safeParse(data);
    const fieldErrors: StepFieldErrors = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof OnboardingFormData;
        const key = VALIDATION_KEY_BY_FIELD[field];
        if (key && !fieldErrors[field]) {
          fieldErrors[field] = t(key, { count: MIN_INTERESTS });
        }
      }
    }

    // Agrupa os erros por step a partir do mapa declarativo (sem índices mágicos).
    return ONBOARDING_STEPS.map((stepMeta) => {
      const errors: StepFieldErrors = {};
      for (const field of ONBOARDING_STEP_FIELDS[stepMeta.id]) {
        if (fieldErrors[field]) errors[field] = fieldErrors[field];
      }
      return errors;
    });
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
    // Vai para o primeiro step com erro (se houver) antes de enviar.
    const firstInvalidStep = stepErrors.findIndex((errors) => Object.keys(errors).length > 0);
    if (firstInvalidStep !== -1) {
      setStep(firstInvalidStep);
      return;
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
  }, [data, stepErrors, updateUser, onSuccess, t, completeOnboardingAsync]);

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
