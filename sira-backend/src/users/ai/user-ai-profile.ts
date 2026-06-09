import { getPreferenceTopicLabels } from '../preferences-options';

/**
 * Campos do usuário usados para montar o resumo enviado à IA.
 * Tolerante a nulos/ausentes — o construtor inclui só o que tem valor.
 */
export interface UserAiProfileInput {
  course?: string | null;
  educationLevel?: string | null;
  mainArea?: string | null;
  subAreas?: string | null;
  currentWork?: string | null;
  interests?: string[] | null;
  academicGoal?: string | null;
  materialLevels?: string[] | null;
  languages?: string[] | null;
  wantsBooks?: boolean | null;
  wantsArticles?: boolean | null;
}

type ProfileField = {
  /** Rótulo (em inglês) que aparece no prompt. */
  label: string;
  /** Extrai o valor já legível para a IA (ou null para omitir a linha). */
  resolve: (user: UserAiProfileInput) => string | null | undefined;
};

/** Resolve um ID de tópico para o label legível; cai no valor cru se desconhecido. */
const topicLabel = (id: string | null | undefined): string | null => {
  if (!id) return null;
  const [label] = getPreferenceTopicLabels([id]);
  return label ?? id;
};

const topicLabelsJoined = (ids: string[] | null | undefined): string | null => {
  if (!ids?.length) return null;
  const labels = getPreferenceTopicLabels(ids);
  // Mantém eventuais IDs sem correspondência como fallback, sem perdê-los.
  const resolved = ids.map(id => topicLabel(id)).filter((v): v is string => !!v);
  return (labels.length ? labels : resolved).join(', ') || null;
};

/** "Books, Articles" — omite a linha se o usuário não tem formatos definidos. */
const formatsLabel = (user: UserAiProfileInput): string | null => {
  if (user.wantsBooks == null && user.wantsArticles == null) return null;
  const formats: string[] = [];
  if (user.wantsBooks) formats.push('Books');
  if (user.wantsArticles) formats.push('Articles');
  return formats.length ? formats.join(', ') : null;
};

/**
 * FONTE ÚNICA da composição do resumo do usuário para a IA.
 *
 * Adicionar/remover/reordenar um campo do resumo = editar esta lista. Tanto a
 * busca conversacional quanto as recomendações devem consumir `buildUserAiProfile`
 * para evitar drift entre prompts. Resolve IDs (área/interesses) para labels
 * legíveis num só lugar — antes a trilha de busca mandava os IDs crus.
 */
const AI_PROFILE_FIELDS: ProfileField[] = [
  { label: 'Course', resolve: u => u.course },
  { label: 'Education level', resolve: u => u.educationLevel },
  { label: 'Main area', resolve: u => topicLabel(u.mainArea) },
  { label: 'Subareas', resolve: u => u.subAreas },
  { label: 'Currently working on', resolve: u => u.currentWork },
  { label: 'Interests', resolve: u => topicLabelsJoined(u.interests) },
  { label: 'Academic goal', resolve: u => u.academicGoal },
  { label: 'Preferred material level', resolve: u => u.materialLevels?.join(', ') },
  { label: 'Languages', resolve: u => u.languages?.join(', ') },
  { label: 'Desired formats', resolve: u => formatsLabel(u) },
];

const PROFILE_UNAVAILABLE = 'User profile not available.';

/**
 * Monta o texto do perfil do usuário para o prompt. Saída determinística
 * (ordem fixa, só linhas com valor) — importante para o cache de `system`.
 * Sem indentação/padding: o chamador insere onde precisar.
 */
export const buildUserAiProfile = (user: UserAiProfileInput | null | undefined): string => {
  if (!user) return PROFILE_UNAVAILABLE;

  const lines = AI_PROFILE_FIELDS
    .map(field => ({ label: field.label, value: field.resolve(user)?.trim() }))
    .filter((field): field is { label: string; value: string } => !!field.value)
    .map(field => `- ${field.label}: ${field.value}`);

  if (lines.length === 0) return PROFILE_UNAVAILABLE;

  return ['USER PROFILE (values preserved in their original language):', ...lines].join('\n');
};
