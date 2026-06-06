import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MaterialDto, MaterialType } from '../dto/material.dto';
import { SearchFilters } from '../types/materials.types';
import { MaterialScoringService } from '../services/material-scoring.service';
import { fetchWithRetry } from './fetch-with-retry';
import { AREA_OA_CONCEPT, LANGUAGE_ISO } from './area-mappings';
import { OpenAlexResponse, OpenAlexWork } from '../types/external-api.types';

@Injectable()
export class OpenAlexClient {
  private readonly logger = new Logger(OpenAlexClient.name);
  private readonly baseUrl = 'https://api.openalex.org/works';

  constructor(
    private readonly http: HttpService,
    private readonly scoring: MaterialScoringService,
  ) {}

  private reconstructAbstract(invertedIndex: Record<string, number[]> | null): string {
    if (!invertedIndex || Object.keys(invertedIndex).length === 0) return 'Resumo não disponível.';
    const entries: [number, string][] = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
      for (const pos of positions) entries.push([pos, word]);
    }
    return entries.sort((a, b) => a[0] - b[0]).map(([, w]) => w).join(' ');
  }

  async search(query: string, filters?: SearchFilters): Promise<MaterialDto[]> {
    const mailto = process.env.OPENALEX_MAILTO;

    let url = `${this.baseUrl}?search=${encodeURIComponent(query)}&per-page=20&select=id,title,authorships,publication_year,abstract_inverted_index,primary_location,doi,open_access,type,cited_by_count,language`;

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
      const response = await fetchWithRetry(() => firstValueFrom(this.http.get<OpenAlexResponse>(url)), this.logger);
      const results: OpenAlexWork[] = response.data?.results ?? [];

      const filtered = results.filter((item): item is OpenAlexWork & { title: string } => Boolean(item.title));
      return filtered.map((item, index) => {
        const isBook = item.type === 'book' || item.type === 'book-chapter';
        const authors = (item.authorships || [])
          .slice(0, 5)
          .map((a) => a.author?.display_name)
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
          relevance: this.scoring.positionScore(index, filtered.length) + this.scoring.citationBoost(item.cited_by_count ?? 0),
          abstract: this.reconstructAbstract(item.abstract_inverted_index ?? null),
          image: undefined,
          url,
          isOpenAccess: item.open_access?.is_oa === true || !!item.open_access?.oa_url,
          doi: item.doi || undefined,
          language: item.language ?? undefined,
        };
      });
    } catch (error) {
      this.logger.error(`Erro ao buscar no OpenAlex: ${(error as Error).message}`);
      return [];
    }
  }
}
