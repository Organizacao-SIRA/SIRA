import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MaterialDto, MaterialType } from '../dto/material.dto';
import { SearchFilters } from '../types/materials.types';
import { MaterialScoringService } from '../services/material-scoring.service';
import { fetchWithRetry } from './fetch-with-retry';
import { AREA_SS_FIELDS } from './area-mappings';

@Injectable()
export class SemanticScholarClient {
  private readonly logger = new Logger(SemanticScholarClient.name);
  private readonly baseUrl = 'https://api.semanticscholar.org/graph/v1/paper/search';

  constructor(
    private readonly http: HttpService,
    private readonly scoring: MaterialScoringService,
  ) {}

  async search(query: string, filters?: SearchFilters): Promise<MaterialDto[]> {
    const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
    const headers = apiKey ? { 'x-api-key': apiKey } : {};

    // Vírgulas no parâmetro fields devem ficar literais — URLSearchParams as codifica como %2C,
    // o que faz a API ignorar o parâmetro. Por isso concatenamos a URL manualmente.
    let url = `${this.baseUrl}?query=${encodeURIComponent(query)}&limit=20&fields=title,authors,year,abstract,venue,url,openAccessPdf,isOpenAccess,citationCount,externalIds`;

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
      const response = await fetchWithRetry(() => firstValueFrom(this.http.get(url, { headers })), this.logger);

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
          relevance: this.scoring.positionScore(index, data.length) + this.scoring.citationBoost(item.citationCount ?? 0),
          abstract: item.abstract || 'Resumo acadêmico indisponível.',
          url: item.openAccessPdf?.url || arxivPdfUrl || item.url || `https://www.semanticscholar.org/paper/${item.paperId}`,
          isOpenAccess: item.isOpenAccess === true || !!item.openAccessPdf?.url || !!arxivId,
        };
      });
    } catch (error) {
      this.logger.error(`Erro ao buscar no Semantic Scholar: ${(error as Error).message}`);
      if ((error as { response?: { status?: number } })?.response?.status === 429) {
        this.logger.warn('Semantic Scholar API: Limite de requisições excedido mesmo após retentativas. Configure SEMANTIC_SCHOLAR_API_KEY no .env.');
      }
      return [];
    }
  }
}
