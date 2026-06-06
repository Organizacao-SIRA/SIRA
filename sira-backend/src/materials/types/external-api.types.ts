/**
 * Tipos mínimos das respostas brutas das APIs externas de materiais.
 *
 * Modelamos APENAS os campos realmente usados pelos clients — não a API inteira.
 * Todos os campos são opcionais de propósito: as respostas externas são pouco
 * confiáveis (campos ausentes, nulos ou inesperados), e os clients já aplicam
 * fallback seguro em cada acesso.
 */

// ── Google Books ──────────────────────────────────────────────────
export interface GoogleBooksVolume {
  id?: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publishedDate?: string;
    publisher?: string;
    description?: string;
    imageLinks?: { thumbnail?: string };
    language?: string;
  };
  accessInfo?: {
    publicDomain?: boolean;
    accessViewStatus?: string;
    webReaderLink?: string;
  };
  saleInfo?: { saleability?: string };
}

export interface GoogleBooksResponse {
  items?: GoogleBooksVolume[];
}

// ── Semantic Scholar ──────────────────────────────────────────────
export interface SemanticScholarAuthor {
  name?: string;
}

export interface SemanticScholarPaper {
  paperId?: string;
  title?: string;
  authors?: SemanticScholarAuthor[];
  year?: number | null;
  venue?: string;
  abstract?: string;
  url?: string;
  openAccessPdf?: { url?: string } | null;
  isOpenAccess?: boolean;
  citationCount?: number;
  externalIds?: { ArXiv?: string } | null;
}

export interface SemanticScholarResponse {
  data?: SemanticScholarPaper[];
}

// ── OpenAlex ──────────────────────────────────────────────────────
export interface OpenAlexAuthorship {
  author?: { display_name?: string };
}

export interface OpenAlexWork {
  id?: string;
  title?: string;
  authorships?: OpenAlexAuthorship[];
  publication_year?: number;
  abstract_inverted_index?: Record<string, number[]> | null;
  primary_location?: {
    landing_page_url?: string;
    source?: { display_name?: string };
  } | null;
  doi?: string;
  open_access?: { is_oa?: boolean; oa_url?: string } | null;
  type?: string;
  cited_by_count?: number;
  language?: string;
}

export interface OpenAlexResponse {
  results?: OpenAlexWork[];
}
