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
