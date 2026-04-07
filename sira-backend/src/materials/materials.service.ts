import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MaterialDto, MaterialType } from './dto/material.dto';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);
  private readonly GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';
  private readonly SEMANTIC_SCHOLAR_URL = 'https://api.semanticscholar.org/graph/v1/paper/search';

  constructor(private readonly httpService: HttpService) {}

  async search(query: string): Promise<MaterialDto[]> {
    if (!query || query.length < 2) return [];

    try {
      this.logger.log(`Iniciando busca acadêmica para: "${query}"`);

      // Execução Paralela para Performance (Platform Engineering Best Practice)
      const [googleData, semanticData] = await Promise.all([
        this.fetchGoogleBooks(query),
        this.fetchSemanticScholar(query),
      ]);

      const results = [...googleData, ...semanticData];
      
      // Ordenar por relevância (Simulado por enquanto, futuramente alimentado pela IA)
      return results.sort((a, b) => b.relevance - a.relevance);
    } catch (error) {
      this.logger.error(`Erro na busca acadêmica: ${error.message}`);
      return [];
    }
  }

  private async fetchGoogleBooks(query: string): Promise<MaterialDto[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.GOOGLE_BOOKS_URL}?q=${encodeURIComponent(query)}&maxResults=8`)
      );

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
      }));
    } catch {
      return [];
    }
  }

  private async fetchSemanticScholar(query: string): Promise<MaterialDto[]> {
    try {
      const url = `${this.SEMANTIC_SCHOLAR_URL}?query=${encodeURIComponent(query)}&limit=8&fields=title,authors,year,abstract,venue`;
      const response = await firstValueFrom(this.httpService.get(url));

      return (response.data.data || []).map((item: any) => ({
        id: `ss-${item.paperId}`,
        type: MaterialType.ARTICLE,
        title: item.title || 'Título Indisponível',
        authors: item.authors?.map((a: any) => a.name).join(', ') || 'Vários autores',
        year: item.year || 'N/A',
        source: item.venue || 'Semantic Scholar',
        relevance: Math.floor(Math.random() * (99 - 85 + 1)) + 85,
        abstract: item.abstract || 'Resumo acadêmico indisponível.',
      }));
    } catch {
      return [];
    }
  }
}
