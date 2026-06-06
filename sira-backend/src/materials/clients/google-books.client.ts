import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MaterialDto, MaterialType } from '../dto/material.dto';
import { SearchFilters } from '../types/materials.types';
import { MaterialScoringService } from '../services/material-scoring.service';
import { fetchWithRetry } from './fetch-with-retry';
import { AREA_GB_SUBJECT, LANGUAGE_ISO } from './area-mappings';

@Injectable()
export class GoogleBooksClient {
  private readonly logger = new Logger(GoogleBooksClient.name);
  private readonly baseUrl = 'https://www.googleapis.com/books/v1/volumes';

  constructor(
    private readonly http: HttpService,
    private readonly scoring: MaterialScoringService,
  ) {}

  async search(query: string, filters?: SearchFilters): Promise<MaterialDto[]> {
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

    const url = `${this.baseUrl}?${params.toString()}`;

    try {
      const response = await fetchWithRetry(() => firstValueFrom(this.http.get(url)), this.logger);

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
          relevance: this.scoring.positionScore(index, items.length),
          abstract: item.volumeInfo?.description || 'Sem resumo disponível.',
          image: item.volumeInfo?.imageLinks?.thumbnail || null,
          url,
          isOpenAccess,
          language: item.volumeInfo?.language ?? undefined,
        };
      });
    } catch (error) {
      this.logger.error(`Erro ao buscar no Google Books: ${(error as Error).message}`);
      if ((error as { response?: { status?: number } })?.response?.status === 429) {
        this.logger.warn('Google Books API: Limite de requisições excedido mesmo após retentativas. Configure GOOGLE_BOOKS_API_KEY no .env.');
      }
      return [];
    }
  }
}
