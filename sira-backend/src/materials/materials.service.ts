import { Injectable, Logger } from '@nestjs/common';
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

  private cache = new Map<string, { data: MaterialDto[], timestamp: number }>();
  private readonly CACHE_TTL = 3600 * 1000;

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly ai: AiProvider,
  ) {}

  async ensureMaterialExists(data: MaterialDto) {
    const existing = await this.prisma.material.findUnique({
      where: { id: data.id },
    });

    if (existing) return existing;

    return this.prisma.material.create({
      data: {
        id: data.id,
        type: data.type,
        title: data.title,
        authors: data.authors,
        year: data.year.toString(),
        source: data.source,
        relevance: data.relevance,
        abstract: data.abstract,
        image: data.image,
        url: data.url,
        thematicArea: data.thematicArea,
        doi: data.doi,
        isbn: data.isbn,
        level: data.level,
        aiJustification: data.aiJustification,
      },
    });
  }

  async search(query: string, userId?: string, page = 0): Promise<{ items: MaterialDto[]; total: number }> {
    const PAGE_SIZE = 4;
    const MAX_RESULTS = 20;

    if (!query || query.trim().length < 2) return { items: [], total: 0 };

    const cacheKey = query.toLowerCase().trim();

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
        const [googleData, semanticData] = await Promise.all([
          this.fetchGoogleBooks(query),
          this.fetchSemanticScholar(query),
        ]);
        rawResults = [...googleData, ...semanticData];
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

    if (!userId || pageItems.length === 0) {
      return { items: pageItems.sort((a, b) => b.relevance - a.relevance), total };
    }

    this.logger.log(`Classificando com IA ${pageItems.length} itens da página ${page} (userId: ${userId})`);
    try {
      const ranked = await this.rankWithAi(query, userId, pageItems);
      return { items: ranked, total };
    } catch (error) {
      this.logger.error(`Erro ao classificar com IA: ${error.message}`, error.stack);
      return { items: pageItems.sort((a, b) => b.relevance - a.relevance), total };
    }
  }

  async chatSearch(prompt: string, userId?: string): Promise<ChatSearchResponseDto> {
    this.logger.log(`Iniciando chatSearch para: "${prompt}"`);

    const user = userId ? await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        course: true,
        educationLevel: true,
        mainArea: true,
        interests: true,
        academicGoal: true,
        materialLevels: true,
        languages: true
      }
    }) : null;

    if (userId) {
      this.saveSearchHistory(userId, prompt.trim()).catch(() => {});
    }

    const userProfileText = user ? `
      PERFIL DO USUÁRIO:
      - Curso: ${user.course}
      - Nível: ${user.educationLevel}
      - Área: ${user.mainArea}
      - Interesses: ${user.interests?.join(', ')}
      - Objetivo: ${user.academicGoal}
      - Nível de material pref: ${user.materialLevels?.join(', ')}
      - Idiomas: ${user.languages?.join(', ')}
    ` : 'Perfil não disponível.';

    // Fase 1: Interpretação de Intenção
    let queries: string[] = [];
    try {
      const rawKeywords = await this.ai.complete({
        system: `Você é um assistente acadêmico. Considere o perfil do usuário para extrair termos de busca.
            ${userProfileText}
            Extraia até 3 termos de busca otimizados (em inglês ou português) para APIs de livros e artigos.
            Retorne apenas os termos separados por vírgula.`,
        user: prompt,
        maxTokens: 200,
      });
      queries = rawKeywords.split(',').map(q => q.trim()).filter(Boolean);
    } catch (error) {
      this.logger.error(`Erro ao extrair keywords via Claude: ${error.message}`);
      queries = [prompt.trim()];
    }
    this.logger.log(`Queries extraídas: ${queries.join(', ')}`);

    // Fase 2: Coleta de Dados
    const searchPromises = queries.map(query =>
      Promise.all([this.fetchGoogleBooks(query), this.fetchSemanticScholar(query)])
    );
    const resultsArrays = await Promise.all(searchPromises);

    const seen = new Set<string>();
    const candidates: MaterialDto[] = [];
    for (const apiResults of resultsArrays) {
      for (const list of apiResults) {
        for (const item of list) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            candidates.push(item);
          }
        }
      }
    }

    if (candidates.length === 0) {
      return {
        aiMessage: 'Não consegui encontrar materiais nas bases acadêmicas para este pedido. Tente reformular sua busca.',
        results: [],
      };
    }

    // Fase 3: Análise e Ponderação
    const candidatesText = candidates.slice(0, 15)
      .map(c => `ID:${c.id} | ${c.type} | "${c.title}" | ${c.authors} | ${c.year} | ${(c.abstract || '').substring(0, 150)}`)
      .join('\n');

    try {
      const rawSynthesis = await this.ai.complete({
        system: `Você é um assistente de recomendação acadêmica senior.
            Considere o PERFIL DO USUÁRIO abaixo para selecionar e justificar os materiais:
            ${userProfileText}

            Seu objetivo é analisar os candidatos e selecionar os mais relevantes tanto para o PEDIDO quanto para o PERFIL.
            Retorne um JSON com:
            - "aiMessage": Uma síntese técnica e amigável em português explicando por que esses materiais são ideais para este usuário específico.
            - "selectedIds": IDs dos top materiais (máximo 8).`,
        user: `PEDIDO DO USUÁRIO: "${prompt}"\n\nCANDIDATOS:\n${candidatesText}\n\nRetorne APENAS JSON: {"aiMessage": "...", "selectedIds": ["id1", "id2"]}`,
        maxTokens: 1024,
      });
      const text = rawSynthesis.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const { aiMessage, selectedIds } = JSON.parse(text);

      const finalResults = candidates
        .filter(c => selectedIds.includes(c.id))
        .map(c => ({
          ...c,
          relevance: 100 - selectedIds.indexOf(c.id),
          aiExplanation: 'Selecionado via Chat inteligente.',
        }));

      return { aiMessage, results: finalResults };
    } catch (e) {
      this.logger.error(`Erro na síntese da IA: ${e.message}`);
      return {
        aiMessage: 'Encontrei alguns materiais que podem te ajudar na sua pesquisa.',
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

    const candidatesText = candidates
      .map(c => `ID:${c.id} | ${c.type} | "${c.title}" | ${c.authors} | ${c.year} | ${(c.abstract || '').substring(0, 200)}`)
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
      maxTokens: 1024,
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

    return candidates
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

  private async fetchGoogleBooks(query: string): Promise<MaterialDto[]> {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const url = `${this.GOOGLE_BOOKS_URL}?q=${encodeURIComponent(query)}&maxResults=8${apiKey ? `&key=${apiKey}` : ''}`;

    try {
      const response = await this.fetchWithRetry(() => firstValueFrom(this.httpService.get(url)));

      return (response.data.items || []).map((item: any) => ({
        id: `gb-${item.id}`,
        type: MaterialType.BOOK,
        title: item.volumeInfo?.title || 'Título Indisponível',
        authors: item.volumeInfo?.authors?.join(', ') || 'Autor desconhecido',
        year: (item.volumeInfo?.publishedDate?.split('-')[0] || 'N/A').toString(),
        source: 'Google Books',
        relevance: Math.floor(Math.random() * (99 - 85 + 1)) + 85,
        abstract: item.volumeInfo?.description || 'Sem resumo disponível.',
        image: item.volumeInfo?.imageLinks?.thumbnail || null,
        url: `https://books.google.com/books?id=${item.id}`,
      }));
    } catch (error) {
      this.logger.error(`Erro ao buscar no Google Books: ${error.message}`);
      if (error.response?.status === 429) {
        this.logger.warn('Google Books API: Limite de requisições excedido mesmo após retentativas. Configure GOOGLE_BOOKS_API_KEY no .env.');
      }
      return [];
    }
  }

  private async fetchSemanticScholar(query: string): Promise<MaterialDto[]> {
    const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
    const headers = apiKey ? { 'x-api-key': apiKey } : {};
    const url = `${this.SEMANTIC_SCHOLAR_URL}?query=${encodeURIComponent(query)}&limit=8&fields=title,authors,year,abstract,venue,url,openAccessPdf`;

    try {
      const response = await this.fetchWithRetry(() => firstValueFrom(this.httpService.get(url, { headers })));

      return (response.data.data || []).map((item: any) => ({
        id: `ss-${item.paperId}`,
        type: MaterialType.ARTICLE,
        title: item.title || 'Título Indisponível',
        authors: item.authors?.map((a: any) => a.name).join(', ') || 'Vários autores',
        year: item.year || 'N/A',
        source: item.venue || 'Semantic Scholar',
        relevance: Math.floor(Math.random() * (99 - 85 + 1)) + 85,
        abstract: item.abstract || 'Resumo acadêmico indisponível.',
        url: item.openAccessPdf?.url || item.url || `https://www.semanticscholar.org/paper/${item.paperId}`,
      }));
    } catch (error) {
      this.logger.error(`Erro ao buscar no Semantic Scholar: ${error.message}`);
      if (error.response?.status === 429) {
        this.logger.warn('Semantic Scholar API: Limite de requisições excedido mesmo após retentativas. Configure SEMANTIC_SCHOLAR_API_KEY no .env.');
      }
      return [];
    }
  }
}
