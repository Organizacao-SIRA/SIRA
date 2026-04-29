import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MaterialDto, MaterialType } from './dto/material.dto';
import { PrismaService } from '../prisma/prisma.service';

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
  ) {}

  async search(query: string, userId?: string): Promise<MaterialDto[]> {
    if (!query || query.trim().length < 2) return [];

    const cacheKey = query.toLowerCase().trim();
    const cached = this.cache.get(cacheKey);

    if (userId) {
      this.saveSearchHistory(userId, query.trim()).catch(() => {});
    }

    if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
      this.logger.log(`Retornando resultados em cache para: "${query}"`);
      return cached.data;
    }

    try {
      this.logger.log(`Iniciando busca acadêmica para: "${query}"`);

      const [googleData, semanticData] = await Promise.all([
        this.fetchGoogleBooks(query),
        this.fetchSemanticScholar(query),
      ]);

      const results = [...googleData, ...semanticData]
        .sort((a, b) => b.relevance - a.relevance);

      if (results.length > 0) {
        this.cache.set(cacheKey, { data: results, timestamp: Date.now() });
      }

      return results;
    } catch (error) {
      this.logger.error(`Erro na busca acadêmica: ${error.message}`);
      return [];
    }
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
        year: item.volumeInfo?.publishedDate?.split('-')[0] || 'N/A',
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
