import { Logger } from '@nestjs/common';

// ── Type guards genéricos ─────────────────────────────────────────
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// ── Forma esperada da síntese da IA (chatSearch) ──────────────────
export interface AiSynthesisItem {
  id: string;
  explanation?: string;
}

export interface AiSynthesisResponse {
  aiMessage: string;
  recommendations: AiSynthesisItem[];
}

function isAiSynthesisItem(value: unknown): value is AiSynthesisItem {
  // `explanation` é opcional: o consumidor já trata ausência como `null`.
  return isRecord(value) && isString(value.id);
}

export function isAiSynthesisResponse(value: unknown): value is AiSynthesisResponse {
  return (
    isRecord(value) &&
    isString(value.aiMessage) &&
    Array.isArray(value.recommendations) &&
    value.recommendations.every(isAiSynthesisItem)
  );
}

// ── Forma esperada do ranking de recomendações (rankWithClaude) ──────
export interface AiRankingItem {
  id: string;
  explanation?: string;
  relevance?: number;
  level?: string;
}

export interface AiRankingResponse {
  recommendations: AiRankingItem[];
}

function isAiRankingItem(value: unknown): value is AiRankingItem {
  return isRecord(value) && isString(value.id);
}

export function isAiRankingResponse(value: unknown): value is AiRankingResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.recommendations) &&
    value.recommendations.every(isAiRankingItem)
  );
}

/**
 * Faz parse seguro de JSON vindo da IA.
 *
 * Tolera cercas de markdown (```json … ```), texto extra antes/depois do objeto
 * e respostas vazias. Nunca lança: retorna `unknown` (para ser validado por um
 * type guard) ou `undefined` se o conteúdo não for um JSON válido.
 */
export function parseAiJson(content: string, logger?: Logger): unknown {
  if (!content) return undefined;

  let text = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // Se a IA embrulhou o JSON em prosa, isola do primeiro `{` ao último `}`.
  if (text[0] !== '{' && text[0] !== '[') {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) {
      text = text.slice(start, end + 1);
    }
  }

  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    logger?.warn(`Resposta da IA não é JSON válido: ${(error as Error).message}`);
    return undefined;
  }
}
