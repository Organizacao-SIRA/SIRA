import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '../toast';
import { useAuth } from '../contexts/AuthContext';
import { useCompleteOnboarding } from '../queries/useProfileMutations';
import { clearOnboardingDeferral } from '../app/onboardingDeferral';
import { MIN_INTERESTS, academicPreferencesSchema, createDefaultAcademicPreferences } from '../domain/academicPreferences';
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
const MAX_STEP_KEY = '@sira:onboardingMaxStep';

const readDraft = (): Partial<OnboardingFormData> | null => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** O usuário já tem progresso real (campos-chave preenchidos)? */
const hasMeaningfulContent = (d: Partial<OnboardingFormData> | null | undefined): boolean =>
  !!(d && (d.course || d.mainArea || (d.interests?.length ?? 0) > 0));

const readPersistedStep = (key: string, max: number): number => {
  const raw = sessionStorage.getItem(key);
  const parsed = raw ? parseInt(raw, 10) : 0;
  if (Number.isNaN(parsed)) return 0;
  return Math.min(Math.max(parsed, 0), max);
};

const hydrate = (initial: Partial<OnboardingFormData> | undefined): OnboardingFormData => {
  const defaults = createDefaultAcademicPreferences();
  const draft = readDraft();
  const source = { ...defaults, ...(initial || {}), ...(draft || {}) };
  return {
    course: source.course || '',
    educationLevel: source.educationLevel || defaults.educationLevel,
    mainArea: source.mainArea || '',
    subAreas: source.subAreas || '',
    interests: Array.isArray(source.interests) ? source.interests : [],
    languages: source.languages?.length ? source.languages : defaults.languages,
    materialLevels: source.materialLevels?.length ? source.materialLevels : defaults.materialLevels,
    wantsBooks: source.wantsBooks ?? true,
    wantsArticles: source.wantsArticles ?? true,
    wantsOpenAccessOnly: source.wantsOpenAccessOnly ?? false,
    academicGoal: source.academicGoal || '',
  };
};

interface UseOnboardingFormParams {
  initialData?: ProfileData;
  onSuccess: (profile: UserProfile) => void;
}

export function useOnboardingForm({ initialData, onSuccess }: UseOnboardingFormParams) {
  const { t } = useTranslation('onboarding');
  const { user, updateUser } = useAuth();
  const { mutateAsync: completeOnboardingAsync, isPending: isSaving } = useCompleteOnboarding();
  const maxStep = ONBOARDING_STEPS.length - 1;

  const [data, setData] = useState<OnboardingFormData>(() => hydrate(initialData));
  const [step, setStep] = useState<number>(() => readPersistedStep(STEP_KEY, maxStep));
  // Passo mais distante já alcançado — habilita pular livremente entre steps já
  // visitados (e válidos) pelos pontinhos do progresso.
  const [maxReached, setMaxReached] = useState<number>(() =>
    Math.max(readPersistedStep(STEP_KEY, maxStep), readPersistedStep(MAX_STEP_KEY, maxStep)),
  );

  // Controle da semeadura tardia do perfil:
  // - userTouched: o usuário já editou algo neste fluxo;
  // - hadDraft: já havia um rascunho retomável no mount.
  // Em qualquer um dos casos, o dado do usuário tem precedência e o perfil que
  // chega depois NÃO sobrescreve (consistente com a precedência do `hydrate`).
  const userTouchedRef = useRef(false);
  const hadDraftRef = useRef<boolean | null>(null);
  if (hadDraftRef.current === null) {
    hadDraftRef.current = hasMeaningfulContent(readDraft());
  }

  const hydratedFromProps = useRef(false);
  useEffect(() => {
    if (hydratedFromProps.current) return;
    if (userTouchedRef.current || hadDraftRef.current) {
      hydratedFromProps.current = true;
      return;
    }
    if (hasMeaningfulContent(initialData)) {
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

  useEffect(() => {
    sessionStorage.setItem(MAX_STEP_KEY, String(maxReached));
  }, [maxReached]);

  const setField = useCallback(<K extends keyof OnboardingFormData>(field: K, value: OnboardingFormData[K]) => {
    userTouchedRef.current = true;
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleArrayField = useCallback(
    <K extends 'interests' | 'languages' | 'materialLevels'>(field: K, value: string) => {
      userTouchedRef.current = true;
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
    const result = academicPreferencesSchema.safeParse(data);
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
    const nextStep = Math.min(step + 1, maxStep);
    setStep(nextStep);
    setMaxReached((prev) => Math.max(prev, nextStep));
  }, [step, isStepValid, maxStep]);

  const back = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 0));
  }, []);

  // Pode navegar para um step se: for o atual/anterior (voltar é sempre permitido
  // para corrigir); ou já foi alcançado e todos os steps antes dele estão válidos.
  const canNavigateTo = useCallback(
    (target: number) => {
      if (target < 0 || target > maxStep) return false;
      if (target <= step) return true;
      if (target > maxReached) return false;
      for (let i = 0; i < target; i += 1) {
        if (Object.keys(stepErrors[i] || {}).length > 0) return false;
      }
      return true;
    },
    [step, maxReached, maxStep, stepErrors],
  );

  const goTo = useCallback(
    (target: number) => {
      const safe = Math.min(Math.max(target, 0), maxStep);
      if (canNavigateTo(safe)) setStep(safe);
    },
    [maxStep, canNavigateTo],
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
        wantsOpenAccessOnly: data.wantsOpenAccessOnly,
        interests: data.interests,
        academicGoal: data.academicGoal || undefined,
      });

      updateUser({ hasCompletedOnboarding: true });
      if (user) clearOnboardingDeferral(user.id);
      sessionStorage.removeItem(DRAFT_KEY);
      sessionStorage.removeItem(STEP_KEY);
      sessionStorage.removeItem(MAX_STEP_KEY);
      onSuccess(profile);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('validation.submit'));
    }
  }, [data, stepErrors, user, updateUser, onSuccess, t, completeOnboardingAsync]);

  return {
    data,
    setField,
    toggleArrayField,
    step,
    next,
    back,
    goTo,
    canNavigateTo,
    canAdvance,
    isStepValid,
    stepErrors,
    isSaving,
    submit,
    totalSteps: ONBOARDING_STEPS.length,
  };
}
