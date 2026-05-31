import { Injectable, Logger } from '@nestjs/common';
import { normalizeUiLocale } from '../common/constants/ui-locale';
import {
  aiEmptyChatMessage,
  aiGenericFallbackMessage,
  aiOutputInstruction,
  aiOutputLanguageLabel,
} from '../common/constants/ai-output-language';

export interface SearchFilters {
  types: ('book' | 'article')[];
  area: string | null;
  openAccessOnly: boolean;
  yearFrom: number | null;
  languages?: string[];
}

export interface ChatSearchOptions {
  filters?: SearchFilters;
  excludeIds?: string[];
  diversify?: boolean;
  locale?: string;
}

const AREA_GB_SUBJECT: Record<string, string> = {
  ia: 'artificial intelligence',
  cd: 'data science',
  edu: 'education',
  sau: 'medicine',
  dir: 'law',
  eco: 'economics',
  soc: 'sociology',
  amb: 'environment',
  gp: 'public administration',
};

const AREA_SS_FIELDS: Record<string, string> = {
  ia: 'Computer Science',
  cd: 'Computer Science',
  edu: 'Education',
  sau: 'Medicine',
  dir: 'Law',
  eco: 'Economics',
  soc: 'Sociology',
  amb: 'Environmental Science',
  gp: 'Political Science',
};

const LANGUAGE_ISO: Record<string, string> = {
  'Português': 'pt',
  'Inglês': 'en',
  'Espanhol': 'es',
};

const AREA_OA_CONCEPT: Record<string, string> = {
  ia: 'artificial intelligence',
  cd: 'data science',
  edu: 'education',
  sau: 'medicine',
  dir: 'law',
  eco: 'economics',
  soc: 'sociology',
  amb: 'environmental science',
  gp: 'political science',
};
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MaterialDto, MaterialType } from './dto/material.dto';
import { ChatSearchResponseDto } from './dto/chat-search-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AiProvider } from '../ai/ai-provider.abstract';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);
  private readonly GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';
  private readonly SEMANTIC_SCHOLAR_URL = 'https://api.semanticscholar.org/graph/v1/paper/search';
  private readonly OPENALEX_URL = 'https://api.openalex.org/works';

  private cache = new Map<string, { data: MaterialDto[], timestamp: number }>();
  private readonly CACHE_TTL = 3600 * 1000;
  private readonly SEARCH_INVALIDATION_THRESHOLD = 5;

  private positionScore(index: number, total: number): number {
    return Math.round(97 - (index / Math.max(total - 1, 1)) * 27);
  }

  private citationBoost(count: number): number {
    return Math.min(5, Math.round(Math.log10(count + 1) * 2));
  }

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly ai: AiProvider,
  ) {}

  async ensureMaterialExists(data: MaterialDto) {
    const payload = {
      id: data.id,
      type: data.type,
      title: data.title,
      authors: data.authors,
      year: data.year.toString(),
      source: data.source,
      provider: data.provider ?? null,
      relevance: data.relevance,
      abstract: data.abstract ?? null,
      image: data.image ?? null,
      url: data.url ?? null,
      isOpenAccess: data.isOpenAccess ?? false,
      thematicArea: data.thematicArea ?? null,
      doi: data.doi ?? null,
      isbn: data.isbn ?? null,
      level: data.level ?? null,
      aiJustification: data.aiJustification ?? null,
    };
    return this.prisma.material.upsert({
      where: { id: data.id },
      create: payload,
      update: {
        level: payload.level ?? undefined,
        isOpenAccess: payload.isOpenAccess,
        url: payload.url ?? undefined,
      },
    });
  }

  async search(query: string, userId?: string, page = 0, pageSize = 4, filters?: SearchFilters): Promise<{ items: MaterialDto[]; total: number }> {
    const MAX_RESULTS = 40;
    const PAGE_SIZE = Math.min(Math.max(1, pageSize), MAX_RESULTS);

    if (!query || query.trim().length < 2) return { items: [], total: 0 };

    const cacheKey = `${query.toLowerCase().trim()}|${JSON.stringify(filters ?? {})}`;

    if (userId) {
      this.saveSearchHistory(userId, query.trim()).catch(() => {});
    }

    let rawResults: MaterialDto[];
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
      this.logger.log(`Cache hit para: "${query}"`);
      rawResults = cached.data;
    } else {
      try {
        this.logger.log(`Buscando nas APIs para: "${query}"`);
        const promises: Promise<MaterialDto[]>[] = [];
        if (!filters?.types?.length || filters.types.includes('book')) {
          promises.push(this.fetchGoogleBooks(query, filters));
        }
        if (!filters?.types?.length || filters.types.includes('article')) {
          promises.push(this.fetchSemanticScholar(query, filters));
        }
        promises.push(this.fetchOpenAlex(query, filters));
        rawResults = (await Promise.all(promises)).flat();
        if (rawResults.length > 0) {
          this.cache.set(cacheKey, { data: rawResults, timestamp: Date.now() });
        }
      } catch (error) {
        this.logger.error(`Erro na busca acadêmica: ${error.message}`);
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

    const user = userId ? await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        course: true,
        educationLevel: true,
        mainArea: true,
        interests: true,
        academicGoal: true,
        materialLevels: true,
        languages: true,
        uiLocale: true,
      }
    }) : null;

    // Accept-Language tem precedência sobre user.uiLocale porque o save do perfil é
    // fire-and-forget (useUiLocaleSync): logo após o usuário trocar de idioma, o
    // banco ainda pode estar com o valor anterior enquanto a request atual já carrega
    // o cabeçalho atualizado. O perfil entra apenas como fallback.
    const uiLocale = normalizeUiLocale(options.locale ?? user?.uiLocale);
    const outputLanguage = aiOutputLanguageLabel(uiLocale);
    const outputInstruction = aiOutputInstruction(uiLocale);
    this.logger.log(`chatSearch uiLocale=${uiLocale} (header=${options.locale ?? 'none'}, profile=${user?.uiLocale ?? 'none'})`);

    if (userId) {
      this.saveSearchHistory(userId, prompt.trim()).catch(() => {});
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
      this.logger.error(`Erro ao extrair keywords via Claude: ${error.message}`);
      queries = [prompt.trim()];
    }
    queries = [...new Set(queries)].slice(0, diversify ? 6 : 3);
    this.logger.log(`Queries extraídas: ${queries.join(', ')}`);

    // Fase 2: Coleta de Dados
    const searchPromises = queries.map(query => {
      const apiCalls: Promise<MaterialDto[]>[] = [];
      if (!filters?.types?.length || filters.types.includes('book')) {
        apiCalls.push(this.fetchGoogleBooks(query, filters));
      }
      if (!filters?.types?.length || filters.types.includes('article')) {
        apiCalls.push(this.fetchSemanticScholar(query, filters));
      }
      apiCalls.push(this.fetchOpenAlex(query, filters));
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
      this.logger.error(`Erro na síntese da IA: ${e.message}`);
      return {
        aiMessage: aiGenericFallbackMessage(uiLocale),
        results: candidates.slice(0, 5),
      };
    }
  }

  private async rankWithAi(query: string, userId: string, candidates: MaterialDto[]): Promise<MaterialDto[]> {
    const [favorites, recentSearches] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        include: { material: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const favoritesText = favorites
      .map(f => `- "${f.material.title}" (${f.material.authors}) [${f.material.type}]`)
      .join('\n') || 'Nenhum favorito ainda';

    const searchesText = recentSearches
      .map(s => `- "${s.query}"`)
      .join('\n') || 'Nenhuma busca recente';

    const topCandidates = candidates.slice(0, 10);
    const candidatesText = topCandidates
      .map(c => `ID:${c.id} | ${c.type} | "${c.title}" | ${c.authors} | ${c.year} | ${(c.abstract || '').substring(0, 150)}`)
      .join('\n');

    const raw = await this.ai.complete({
      system: 'Você é um assistente de recomendação acadêmica. Analise os resultados de busca e o perfil do usuário para explicar a relevância de cada material. Retorne APENAS JSON válido, sem markdown, sem texto extra fora do JSON.',
      user: `PESQUISA ATUAL: "${query}"

FAVORITOS DO USUÁRIO:
${favoritesText}

BUSCAS RECENTES:
${searchesText}

RESULTADOS:
${candidatesText}

Para cada resultado:
1. Escreva UMA frase curta em português explicando por que é relevante para a pesquisa "${query}" considerando o perfil do usuário.
2. Atribua um score de relevância de 0 a 100.
3. Determine o nível do material: "Introdutório", "Intermediário" ou "Avançado".

JSON: {"results": [{"id": "...", "explanation": "...", "relevance": 0, "level": "..."}]}`,
      maxTokens: 2048,
    });
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(text);

    const metaMap = new Map<string, { explanation: string; relevance: number; level: string }>(
      parsed.results.map((r: { id: string; explanation: string; relevance: number; level: string }) => [
        r.id,
        {
          explanation: r.explanation,
          relevance: Math.min(100, Math.max(0, Math.round(r.relevance))),
          level: r.level,
        },
      ]),
    );

    return topCandidates
      .map(c => ({
        ...c,
        aiExplanation: metaMap.get(c.id)?.explanation ?? null,
        relevance: metaMap.get(c.id)?.relevance ?? c.relevance,
        level: metaMap.get(c.id)?.level,
      }))
      .sort((a, b) => b.relevance - a.relevance);
  }

  private async saveSearchHistory(userId: string, query: string): Promise<void> {
    await this.prisma.searchHistory.create({ data: { userId, query } });
    await this.maybeInvalidateRecommendationCache(userId);
  }

  private async maybeInvalidateRecommendationCache(userId: string): Promise<void> {
    const cache = await this.prisma.recommendationCache.findUnique({
      where: { userId },
      select: { generatedAt: true },
    });
    if (!cache) return;

    const searchesSince = await this.prisma.searchHistory.count({
      where: { userId, createdAt: { gt: cache.generatedAt } },
    });

    if (searchesSince >= this.SEARCH_INVALIDATION_THRESHOLD) {
      await this.prisma.recommendationCache.deleteMany({ where: { userId } });
    }
  }

  private async fetchWithRetry<T>(
    fn: () => Promise<T>,
    retries = 2,
    delayMs = 1000,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429 && retries > 0) {
        this.logger.warn(`Rate limit atingido — aguardando ${delayMs}ms e tentando novamente (${retries} tentativas restantes)`);
        await new Promise(r => setTimeout(r, delayMs));
        return this.fetchWithRetry(fn, retries - 1, delayMs * 2);
      }
      throw error;
    }
  }

  private async fetchGoogleBooks(query: string, filters?: SearchFilters): Promise<MaterialDto[]> {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    let q = query;
    if (filters?.area && AREA_GB_SUBJECT[filters.area]) {
      q += `+subject:${AREA_GB_SUBJECT[filters.area]}`;
    }
    // A API do Google Books não tem filtro nativo de ano — aplicamos client-side após o fetch.
    // Para compensar, aumentamos maxResults e priorizamos publicações recentes quando yearFrom está definido.
    const maxResults = filters?.yearFrom ? '40' : '20';
    const params = new URLSearchParams({ q, maxResults });
    if (apiKey) params.set('key', apiKey);
    if (filters?.openAccessOnly) params.set('filter', 'free-ebooks');
    if (filters?.yearFrom) params.set('orderBy', 'newest');

    const isoCodes = (filters?.languages ?? []).map(l => LANGUAGE_ISO[l]).filter(Boolean);
    if (isoCodes.length === 1) params.set('langRestrict', isoCodes[0]);

    const url = `${this.GOOGLE_BOOKS_URL}?${params.toString()}`;

    try {
      const response = await this.fetchWithRetry(() => firstValueFrom(this.httpService.get(url)));

      let items: any[] = (response.data.items || []);

      if (filters?.yearFrom) {
        items = items.filter(item => {
          const year = parseInt(item.volumeInfo?.publishedDate?.split('-')[0] || '0', 10);
          return year >= filters.yearFrom!;
        });
      }

      if (isoCodes.length > 0) {
        items = items.filter(item => {
          const lang = item.volumeInfo?.language;
          return !lang || isoCodes.some(code => lang.startsWith(code));
        });
      }

      return items.map((item: any, index: number) => {
        const isOpenAccess =
          item.accessInfo?.publicDomain === true ||
          item.saleInfo?.saleability === 'FREE' ||
          item.accessInfo?.accessViewStatus === 'FULL_PUBLIC_DOMAIN';

        const url = isOpenAccess && item.accessInfo?.webReaderLink
          ? item.accessInfo.webReaderLink
          : `https://books.google.com/books?id=${item.id}`;

        return {
          id: `gb-${item.id}`,
          type: MaterialType.BOOK,
          title: item.volumeInfo?.title || 'Título Indisponível',
          authors: item.volumeInfo?.authors?.join(', ') || 'Autor desconhecido',
          year: (item.volumeInfo?.publishedDate?.split('-')[0] || 'N/A').toString(),
          source: item.volumeInfo?.publisher || 'Google Books',
          provider: 'Google Books',
          relevance: this.positionScore(index, items.length),
          abstract: item.volumeInfo?.description || 'Sem resumo disponível.',
          image: item.volumeInfo?.imageLinks?.thumbnail || null,
          url,
          isOpenAccess,
          language: item.volumeInfo?.language ?? undefined,
        };
      });
    } catch (error) {
      this.logger.error(`Erro ao buscar no Google Books: ${error.message}`);
      if (error.response?.status === 429) {
        this.logger.warn('Google Books API: Limite de requisições excedido mesmo após retentativas. Configure GOOGLE_BOOKS_API_KEY no .env.');
      }
      return [];
    }
  }

  private async fetchSemanticScholar(query: string, filters?: SearchFilters): Promise<MaterialDto[]> {
    const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
    const headers = apiKey ? { 'x-api-key': apiKey } : {};

    // Vírgulas no parâmetro fields devem ficar literais — URLSearchParams as codifica como %2C,
    // o que faz a API ignorar o parâmetro. Por isso concatenamos a URL manualmente.
    let url = `${this.SEMANTIC_SCHOLAR_URL}?query=${encodeURIComponent(query)}&limit=20&fields=title,authors,year,abstract,venue,url,openAccessPdf,isOpenAccess,citationCount,externalIds`;

    if (filters?.area && AREA_SS_FIELDS[filters.area]) {
      url += `&fieldsOfStudy=${encodeURIComponent(AREA_SS_FIELDS[filters.area])}`;
    }
    if (filters?.yearFrom) {
      url += `&year=${filters.yearFrom}-`;
    }
    if (filters?.types?.length === 1 && filters.types[0] === 'article') {
      url += '&publicationTypes=JournalArticle,Review,Conference,ClinicalTrial,Editorial,Letter,Study';
    }

    try {
      const response = await this.fetchWithRetry(() => firstValueFrom(this.httpService.get(url, { headers })));

      let data: any[] = response.data.data || [];
      if (filters?.openAccessOnly) {
        data = data.filter(item => item.isOpenAccess || item.openAccessPdf?.url || item.externalIds?.ArXiv);
      }

      return data.map((item: any, index: number) => {
        const arxivId = item.externalIds?.ArXiv;
        const arxivPdfUrl = arxivId ? `https://arxiv.org/pdf/${arxivId}` : null;
        return {
          id: `ss-${item.paperId}`,
          type: MaterialType.ARTICLE,
          title: item.title || 'Título Indisponível',
          authors: item.authors?.map((a: any) => a.name).join(', ') || 'Vários autores',
          year: item.year != null ? String(item.year) : 'N/A',
          source: item.venue || 'Semantic Scholar',
          provider: 'Semantic Scholar',
          relevance: this.positionScore(index, data.length) + this.citationBoost(item.citationCount ?? 0),
          abstract: item.abstract || 'Resumo acadêmico indisponível.',
          url: item.openAccessPdf?.url || arxivPdfUrl || item.url || `https://www.semanticscholar.org/paper/${item.paperId}`,
          isOpenAccess: item.isOpenAccess === true || !!item.openAccessPdf?.url || !!arxivId,
        };
      });
    } catch (error) {
      this.logger.error(`Erro ao buscar no Semantic Scholar: ${error.message}`);
      if (error.response?.status === 429) {
        this.logger.warn('Semantic Scholar API: Limite de requisições excedido mesmo após retentativas. Configure SEMANTIC_SCHOLAR_API_KEY no .env.');
      }
      return [];
    }
  }

  private reconstructAbstract(invertedIndex: Record<string, number[]> | null): string {
    if (!invertedIndex || Object.keys(invertedIndex).length === 0) return 'Resumo não disponível.';
    const entries: [number, string][] = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
      for (const pos of positions) entries.push([pos, word]);
    }
    return entries.sort((a, b) => a[0] - b[0]).map(([, w]) => w).join(' ');
  }

  private async fetchOpenAlex(query: string, filters?: SearchFilters): Promise<MaterialDto[]> {
    const mailto = process.env.OPENALEX_MAILTO;

    let url = `${this.OPENALEX_URL}?search=${encodeURIComponent(query)}&per-page=20&select=id,title,authorships,publication_year,abstract_inverted_index,primary_location,doi,open_access,type,cited_by_count,language`;

    const filterParts: string[] = [];
    if (filters?.openAccessOnly) filterParts.push('open_access.is_oa:true');
    if (filters?.yearFrom) filterParts.push(`publication_year:>${filters.yearFrom - 1}`);
    if (filters?.types?.length === 1) {
      filterParts.push(filters.types[0] === 'book' ? 'type:book' : 'type:article');
    }
    if (filters?.area && AREA_OA_CONCEPT[filters.area]) {
      filterParts.push(`topics.display_name.search:${encodeURIComponent(AREA_OA_CONCEPT[filters.area])}`);
    }
    const oaIsoCodes = (filters?.languages ?? []).map(l => LANGUAGE_ISO[l]).filter(Boolean);
    if (oaIsoCodes.length > 0) filterParts.push(`language:${oaIsoCodes.join('|')}`);
    if (filterParts.length > 0) url += `&filter=${filterParts.join(',')}`;

    if (mailto) url += `&mailto=${encodeURIComponent(mailto)}`;

    try {
      const response = await this.fetchWithRetry(() => firstValueFrom(this.httpService.get(url)));
      const results: any[] = response.data.results || [];

      const filtered = results.filter(item => item.title);
      return filtered.map((item: any, index: number) => {
          const isBook = item.type === 'book' || item.type === 'book-chapter';
          const authors = (item.authorships || [])
            .slice(0, 5)
            .map((a: any) => a.author?.display_name)
            .filter(Boolean)
            .join(', ') || 'Autores não informados';
          const openAccessUrl = item.open_access?.oa_url;
          const landingUrl = item.primary_location?.landing_page_url;
          const doiUrl = item.doi ? `https://doi.org/${item.doi.replace('https://doi.org/', '')}` : null;
          const url = openAccessUrl || landingUrl || doiUrl || `https://openalex.org/${item.id}`;
          const oaId = item.id?.replace('https://openalex.org/', '') || item.id;

          return {
            id: `oa-${oaId}`,
            type: isBook ? MaterialType.BOOK : MaterialType.ARTICLE,
            title: item.title,
            authors,
            year: item.publication_year?.toString() || 'N/A',
            source: item.primary_location?.source?.display_name || 'OpenAlex',
            provider: 'OpenAlex',
            relevance: this.positionScore(index, filtered.length) + this.citationBoost(item.cited_by_count ?? 0),
            abstract: this.reconstructAbstract(item.abstract_inverted_index),
            image: null,
            url,
            isOpenAccess: item.open_access?.is_oa === true || !!item.open_access?.oa_url,
            doi: item.doi || null,
            language: item.language ?? undefined,
          };
        });
    } catch (error) {
      this.logger.error(`Erro ao buscar no OpenAlex: ${error.message}`);
      return [];
    }
  }
}
