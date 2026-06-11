import { z } from 'zod';
import {
  DEFAULT_EDUCATION_LEVEL,
  DEFAULT_LANGUAGES,
  DEFAULT_MATERIAL_LEVELS,
} from '@/i18n/preferenceValues';
import type { UserProfile } from '@/types';

/**
 * Mínimo de áreas de interesse exigido no onboarding.
 * Fonte única do "3" — referenciado pela validação e pelas mensagens i18n.
 */
export const MIN_INTERESTS = 3;

/**
 * Forma (campos) das preferências acadêmicas — um `ZodObject` "puro", para
 * permitir derivar subconjuntos com `.pick()`/`.partial()` e inferir o tipo.
 */
const academicPreferencesShape = z.object({
  course: z.string().trim().min(2),
  educationLevel: z.string().min(1),
  mainArea: z.string().min(1),
  subAreas: z.string(),
  currentWork: z.string(),
  interests: z.array(z.string()).min(MIN_INTERESTS),
  languages: z.array(z.string()).min(1),
  materialLevels: z.array(z.string()).min(1),
  wantsBooks: z.boolean(),
  wantsArticles: z.boolean(),
  academicGoal: z.string(),
});

/**
 * Contrato ÚNICO das preferências acadêmicas — o conjunto de campos que o
 * onboarding coleta e que as Configurações editam.
 *
 * Tipos e validação derivam daqui: incluir um campo neste schema obriga o
 * compilador a tratá-lo em todas as telas, impedindo o "drift" silencioso
 * entre onboarding e configurações (foi assim que `subAreas` ficou
 * dessincronizado entre as telas no passado).
 *
 * As mensagens de erro NÃO moram no schema (ele carrega apenas as regras). A
 * tradução por campo acontece na camada de UI, reaproveitando as chaves i18n
 * `validation.*` — mantendo o schema puro e independente de i18n.
 */
export const academicPreferencesSchema = academicPreferencesShape.refine(
  (data) => data.wantsBooks || data.wantsArticles,
  { path: ['wantsBooks'] },
);

export type AcademicPreferences = z.infer<typeof academicPreferencesShape>;

/** Campo de preferência acadêmica (chave do contrato). */
export type AcademicPreferenceField = keyof AcademicPreferences;

/** Valores iniciais de um perfil ainda não preenchido. */
export const createDefaultAcademicPreferences = (): AcademicPreferences => ({
  course: '',
  educationLevel: DEFAULT_EDUCATION_LEVEL,
  mainArea: '',
  subAreas: '',
  currentWork: '',
  interests: [],
  languages: [...DEFAULT_LANGUAGES],
  materialLevels: [...DEFAULT_MATERIAL_LEVELS],
  wantsBooks: true,
  wantsArticles: true,
  academicGoal: '',
});

/** Subconjunto do `UserProfile` que carrega as preferências acadêmicas. */
type ProfilePreferenceSource = Pick<UserProfile, AcademicPreferenceField>;

/**
 * Adaptador servidor → formulário. Resolve, num único lugar, a impedância
 * entre o `UserProfile` (campos anuláveis: `string | null`) e o formulário
 * (campos sempre `string`/array). Antes essa conversão `null → ''` estava
 * espalhada campo a campo em vários arquivos.
 */
export const academicPreferencesFromProfile = (
  profile: ProfilePreferenceSource,
): AcademicPreferences => {
  const defaults = createDefaultAcademicPreferences();
  return {
    course: profile.course ?? '',
    educationLevel: profile.educationLevel || defaults.educationLevel,
    mainArea: profile.mainArea ?? '',
    subAreas: profile.subAreas ?? '',
    currentWork: profile.currentWork ?? '',
    interests: profile.interests ?? [],
    languages: profile.languages?.length ? profile.languages : defaults.languages,
    materialLevels: profile.materialLevels?.length ? profile.materialLevels : defaults.materialLevels,
    wantsBooks: profile.wantsBooks ?? true,
    wantsArticles: profile.wantsArticles ?? true,
    academicGoal: profile.academicGoal ?? '',
  };
};
