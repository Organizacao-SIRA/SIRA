import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import Anthropic from '@anthropic-ai/sdk';
import { MaterialDto, MaterialType } from './dto/material.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);
  private readonly anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  private readonly GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';
  private readonly SEMANTIC_SCHOLAR_URL = 'https://api.semanticscholar.org/graph/v1/paper/search';

  private cache = new Map<string, { data: MaterialDto[], timestamp: number }>();
  private readonly CACHE_TTL = 3600 * 1000;

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
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
        aiJustification: data.aiJustification,
      },
    });
  }

  async search(query: string, userId?: string): Promise<MaterialDto[]> {
    if (!query || query.trim().length < 2) return [];

    const cacheKey = query.toLowerCase().trim();

    if (userId) {
      this.saveSearchHistory(userId, query.trim()).catch(() => {});
    }

    let rawResults: MaterialDto[];
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
      this.logger.log(`Retornando resultados em cache para: "${query}"`);
      rawResults = cached.data;
    } else {
      try {
        this.logger.log(`Iniciando busca acadêmica para: "${query}"`);

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
        return [];
      }
    }

    if (!userId || rawResults.length === 0) {
      return rawResults.sort((a, b) => b.relevance - a.relevance);
    }

    try {
      return await this.rankWithClaude(query, userId, rawResults);
    } catch (error) {
      this.logger.error(`Erro ao ranquear com Claude: ${error.message}`);
      return rawResults.sort((a, b) => b.relevance - a.relevance);
    }
  }

  private async rankWithClaude(query: string, userId: string, candidates: MaterialDto[]): Promise<MaterialDto[]> {
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

    const response = await this.anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: [
        {
          type: 'text' as const,
          text: 'Você é um assistente de recomendação acadêmica. Analise os resultados de busca e o perfil do usuário para explicar a relevância de cada material. Retorne APENAS JSON válido, sem markdown, sem texto extra fora do JSON.',
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `PESQUISA ATUAL: "${query}"

FAVORITOS DO USUÁRIO:
${favoritesText}

BUSCAS RECENTES:
${searchesText}

RESULTADOS:
${candidatesText}

Para cada resultado, escreva UMA frase curta em português explicando por que é relevante para a pesquisa "${query}" considerando o perfil do usuário, e atribua um score de relevância de 0 a 100.

JSON: {"results": [{"id": "...", "explanation": "...", "relevance": 0}]}`,
        },
      ],
    });

    const raw = response.content[0].type === 'text' ? response.content[0].text : '';
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(text);

    const metaMap = new Map<string, { explanation: string; relevance: number }>(
      parsed.results.map((r: { id: string; explanation: string; relevance: number }) => [
        r.id,
        { explanation: r.explanation, relevance: Math.min(100, Math.max(0, Math.round(r.relevance))) },
      ]),
    );

    return candidates
      .map(c => ({
        ...c,
        aiExplanation: metaMap.get(c.id)?.explanation ?? null,
        relevance: metaMap.get(c.id)?.relevance ?? c.relevance,
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
