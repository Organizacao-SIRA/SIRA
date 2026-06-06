import { Injectable, Logger } from '@nestjs/common';
import { normalizeUiLocale } from '../../common/constants/ui-locale';
import {
  aiEmptyChatMessage,
  aiGenericFallbackMessage,
  aiOutputInstruction,
  aiOutputLanguageLabel,
} from '../../common/constants/ai-output-language';
import { MaterialDto } from '../dto/material.dto';
import { ChatSearchResponseDto } from '../dto/chat-search-response.dto';
import { SearchFilters, ChatSearchOptions } from '../types/materials.types';
import { AiProvider } from '../../ai/ai-provider.abstract';
import { GoogleBooksClient } from '../clients/google-books.client';
import { SemanticScholarClient } from '../clients/semantic-scholar.client';
import { OpenAlexClient } from '../clients/openalex.client';
import { MaterialsCacheService } from '../cache/materials-cache.service';
import { MaterialPersistenceService } from './material-persistence.service';

/**
 * Coordena a busca em múltiplas fontes: chama os clients, lida com falha parcial
 * (cada client retorna `[]` em erro), cacheia, deduplica, balanceia por fonte e
 * aplica a síntese/ranking da IA. Não conhece detalhes internos de cada API.
 */
@Injectable()
export class MaterialsOrchestratorService {
  private readonly logger = new Logger(MaterialsOrchestratorService.name);

  constructor(
    private readonly googleBooks: GoogleBooksClient,
    private readonly semanticScholar: SemanticScholarClient,
    private readonly openAlex: OpenAlexClient,
    private readonly cache: MaterialsCacheService,
    private readonly persistence: MaterialPersistenceService,
    private readonly ai: AiProvider,
  ) {}

  async search(query: string, userId?: string, page = 0, pageSize = 4, filters?: SearchFilters): Promise<{ items: MaterialDto[]; total: number }> {
    const MAX_RESULTS = 40;
    const PAGE_SIZE = Math.min(Math.max(1, pageSize), MAX_RESULTS);

    if (!query || query.trim().length < 2) return { items: [], total: 0 };

    const cacheKey = `${query.toLowerCase().trim()}|${JSON.stringify(filters ?? {})}`;

    if (userId) {
      this.persistence.saveSearchHistory(userId, query.trim()).catch(() => {});
    }

    let rawResults: MaterialDto[];
    const cached = this.cache.get<MaterialDto[]>(cacheKey);

    if (cached) {
      this.logger.log(`Cache hit para: "${query}"`);
      rawResults = cached;
    } else {
      try {
        this.logger.log(`Buscando nas APIs para: "${query}"`);
        const promises: Promise<MaterialDto[]>[] = [];
        if (!filters?.types?.length || filters.types.includes('book')) {
          promises.push(this.googleBooks.search(query, filters));
        }
        if (!filters?.types?.length || filters.types.includes('article')) {
          promises.push(this.semanticScholar.search(query, filters));
        }
        promises.push(this.openAlex.search(query, filters));
        rawResults = (await Promise.all(promises)).flat();
        if (rawResults.length > 0) {
          this.cache.set(cacheKey, rawResults);
        }
      } catch (error) {
        this.logger.error(`Erro na busca acadêmica: ${(error as Error).message}`);
        return { items: [], total: 0 };
      }
    }

    const capped = rawResults.slice(0, MAX_RESULTS);
    const total = capped.length;
    const pageItems = capped.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return { items: pageItems.sort((a, b) => b.relevance - a.relevance), total };
  }

  async chatSearch(prompt: string, userId?: string, options: ChatSearchOptions = {}): Promise<ChatSearchResponseDto> {
    const { filters, excludeIds = [], diversify = false } = options;
    this.logger.log(`Iniciando chatSearch para: "${prompt}"`);
    const excluded = new Set(excludeIds.filter(Boolean));

    const user = userId ? await this.persistence.getUserForChat(userId) : null;

    // Accept-Language tem precedência sobre user.uiLocale porque o save do perfil é
    // fire-and-forget (useUiLocaleSync): logo após o usuário trocar de idioma, o
    // banco ainda pode estar com o valor anterior enquanto a request atual já carrega
    // o cabeçalho atualizado. O perfil entra apenas como fallback.
    const uiLocale = normalizeUiLocale(options.locale ?? user?.uiLocale);
    const outputLanguage = aiOutputLanguageLabel(uiLocale);
    const outputInstruction = aiOutputInstruction(uiLocale);
    this.logger.log(`chatSearch uiLocale=${uiLocale} (header=${options.locale ?? 'none'}, profile=${user?.uiLocale ?? 'none'})`);

    if (userId) {
      this.persistence.saveSearchHistory(userId, prompt.trim()).catch(() => {});
    }

    const userProfileText = user ? `
      USER PROFILE (values preserved in their original language):
      - Course: ${user.course}
      - Education level: ${user.educationLevel}
      - Main area: ${user.mainArea}
      - Interests: ${user.interests?.join(', ')}
      - Academic goal: ${user.academicGoal}
      - Preferred material level: ${user.materialLevels?.join(', ')}
      - Languages: ${user.languages?.join(', ')}
    ` : 'User profile not available.';

    // Fase 1: Interpretação de Intenção
    let queries: string[] = [];
    try {
      const rawKeywords = await this.ai.complete({
        system: diversify ? `You are an academic bibliographic research specialist.
            User profile: ${userProfileText}
            Your task: extract 4 to 6 ENGLISH search terms to find alternative materials for the request.
            Rules:
            - Each term must have 1 to 4 words
            - Use English, since the APIs return more results in English
            - Cover different subtopics, approaches, methods, or applications related to the main request
            - Avoid overly generic terms and avoid repeating the main term without a complement
            - Return ONLY the terms separated by commas, no explanations, no extra punctuation
            Example response: "requirements engineering, software architecture, agile software development, software testing"` :
          `You are an academic bibliographic research specialist.
            User profile: ${userProfileText}
            Your task: extract 2 to 3 ENGLISH search terms to use with the Google Books and Semantic Scholar APIs.
            Rules:
            - Each term must have 1 to 4 words
            - Use English, since the APIs return more results in English
            - Be specific to the main topic of the request
            - Return ONLY the terms separated by commas, no explanations, no extra punctuation
            Example response: "data mining, machine learning, pattern recognition"`,
        user: prompt,
        maxTokens: diversify ? 160 : 100,
      });
      queries = rawKeywords.split(',').map(q => q.trim()).filter(q => q.length > 0 && q.length < 60);
    } catch (error) {
      this.logger.error(`Erro ao extrair keywords via Claude: ${(error as Error).message}`);
      queries = [prompt.trim()];
    }
    queries = [...new Set(queries)].slice(0, diversify ? 6 : 3);
    this.logger.log(`Queries extraídas: ${queries.join(', ')}`);

    // Fase 2: Coleta de Dados
    const searchPromises = queries.map(query => {
      const apiCalls: Promise<MaterialDto[]>[] = [];
      if (!filters?.types?.length || filters.types.includes('book')) {
        apiCalls.push(this.googleBooks.search(query, filters));
      }
      if (!filters?.types?.length || filters.types.includes('article')) {
        apiCalls.push(this.semanticScholar.search(query, filters));
      }
      apiCalls.push(this.openAlex.search(query, filters));
      return Promise.all(apiCalls);
    });
    const resultsArrays = await Promise.all(searchPromises);

    const seen = new Set<string>();
    const candidates: MaterialDto[] = [];
    for (const apiResults of resultsArrays) {
      for (const list of apiResults) {
        for (const item of list) {
          if (!excluded.has(item.id) && !seen.has(item.id)) {
            seen.add(item.id);
            candidates.push(item);
          }
        }
      }
    }

    if (candidates.length === 0) {
      return {
        aiMessage: aiEmptyChatMessage(uiLocale),
        results: [],
      };
    }

    // Fase 3: Análise e Ponderação
    // Intercala candidatos por fonte (gb / ss / oa) em round-robin para garantir
    // que a IA veja resultados de todas as APIs e não apenas do Google Books.
    const bySource = new Map<string, MaterialDto[]>();
    for (const c of candidates) {
      const prefix = c.id.split('-')[0];
      if (!bySource.has(prefix)) bySource.set(prefix, []);
      bySource.get(prefix)!.push(c);
    }
    const sources = [...bySource.values()];
    const balanced: MaterialDto[] = [];
    let round = 0;
    const maxCandidatesForAi = diversify ? 36 : 24;
    while (balanced.length < maxCandidatesForAi && sources.some(s => round < s.length)) {
      for (const s of sources) {
        if (round < s.length) balanced.push(s[round]);
        if (balanced.length >= maxCandidatesForAi) break;
      }
      round++;
    }

    const candidatesText = balanced
      .map(c => `ID:${c.id} | ${c.type} | "${c.title}" | ${c.authors} | ${c.year} | ${(c.abstract || '').substring(0, 300)}`)
      .join('\n');

    try {
      const rawSynthesis = await this.ai.complete({
        system: `${outputInstruction}

            You are a senior academic recommendation assistant.
            Use the USER PROFILE below to select and justify the materials:
            ${userProfileText}

            Your goal is to analyze the candidates and select the most relevant ones for both the REQUEST and the PROFILE.
            ${diversify ? 'This is a new round of suggestions. Prioritize useful materials that bring diversity of subtopics, methods, authors, years, types, and sources. Avoid obvious or very similar choices.' : ''}
            Return a JSON object with:
            - "aiMessage": a general synthesis (2-3 sentences) explaining the selected set of materials${diversify ? ' and what is new in this round' : ''}.
            - "recommendations": array with the top 10 materials (mix books and articles when available). For each item:
              - "id": the exact ID of the candidate
              - "explanation": ONE short sentence explaining why this specific material is relevant to the request and the user profile.

            LANGUAGE RULE (mandatory): aiMessage and every explanation must be written exclusively in ${outputLanguage}. Do not mix languages. Do not translate titles, authors, or external metadata — keep them in their original language.`,
        user: `USER REQUEST: "${prompt}"\n\nCANDIDATES:\n${candidatesText}\n\nReturn ONLY JSON: {"aiMessage": "...", "recommendations": [{"id": "...", "explanation": "..."}]}\n\nReminder: aiMessage and explanation in ${outputLanguage}.`,
        maxTokens: 1500,
      });
      const text = rawSynthesis.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const { aiMessage, recommendations: selected } = JSON.parse(text);

      const explanationMap = new Map<string, string>(
        selected.map((r: { id: string; explanation: string }) => [r.id, r.explanation]),
      );

      const finalResults = candidates
        .filter(c => explanationMap.has(c.id))
        .sort((a, b) => {
          const ids = selected.map((r: { id: string }) => r.id);
          return ids.indexOf(a.id) - ids.indexOf(b.id);
        })
        .map((c, idx) => ({
          ...c,
          relevance: Math.max(100 - idx * 5, 60),
          aiExplanation: explanationMap.get(c.id) ?? null,
        }));

      return { aiMessage, results: finalResults };
    } catch (e) {
      this.logger.error(`Erro na síntese da IA: ${(e as Error).message}`);
      return {
        aiMessage: aiGenericFallbackMessage(uiLocale),
        results: candidates.slice(0, 5),
      };
    }
  }
}
