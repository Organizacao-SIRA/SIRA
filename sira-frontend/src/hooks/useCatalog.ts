import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchCatalogItems, TOPIC_SEARCH_QUERIES } from '../services/api';
import { usePersistedState } from './usePersistedState';
import { usePreferenceOptions } from '../queries/usePreferenceOptions';
import type { SearchFilters } from '../types';

const PAGE_SIZE = 10;
const CATALOG_TTL = 15 * 60 * 1000;
const DEFAULT_FILTERS: SearchFilters = { types: [], area: null, openAccessOnly: false, yearFrom: null };

const CATALOG_VERSION = 'v1';
const CATALOG_STATE_KEY = `@sira:catalog:${CATALOG_VERSION}:state`;

interface CatalogStoredState {
  searchQuery: string;
  submittedQuery: string;
  category: string;
  filters: SearchFilters;
  page: number;
}

const DEFAULT_CATALOG_STATE: CatalogStoredState = {
  searchQuery: '',
  submittedQuery: '',
  category: 'all',
  filters: DEFAULT_FILTERS,
  page: 0,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeFilters = (filters: unknown): SearchFilters => {
  const parsed = isRecord(filters) ? filters : {};
  const types = Array.isArray(parsed.types)
    ? parsed.types.filter((type): type is 'book' | 'article' => type === 'book' || type === 'article')
    : [];

  return {
    types,
    area: typeof parsed.area === 'string' ? parsed.area : null,
    openAccessOnly: Boolean(parsed.openAccessOnly),
    yearFrom: typeof parsed.yearFrom === 'number' ? parsed.yearFrom : null,
  };
};

const validateCatalogState = (value: unknown): CatalogStoredState => {
  const parsed = value as Partial<CatalogStoredState>;
  return {
    searchQuery: typeof parsed?.searchQuery === 'string' ? parsed.searchQuery : DEFAULT_CATALOG_STATE.searchQuery,
    submittedQuery: typeof parsed?.submittedQuery === 'string' ? parsed.submittedQuery : DEFAULT_CATALOG_STATE.submittedQuery,
    category: typeof parsed?.category === 'string' ? parsed.category : DEFAULT_CATALOG_STATE.category,
    filters: normalizeFilters(parsed?.filters),
    page: Number.isInteger(parsed?.page) && Number(parsed.page) >= 0 ? Number(parsed.page) : DEFAULT_CATALOG_STATE.page,
  };
};

// Chave estável da busca — distingue modo busca (search:<q>) de navegação (browse:<cat>).
const buildResultKey = (query: string, categoryId: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length >= 2) return `search:${encodeURIComponent(normalizedQuery)}`;
  return `browse:${categoryId}`;
};

export const useCatalog = () => {
  const [storedState, setStoredState] = usePersistedState<CatalogStoredState>(
    CATALOG_STATE_KEY,
    DEFAULT_CATALOG_STATE,
    { validate: validateCatalogState },
  );

  const [searchQuery, setSearchQueryState] = useState(storedState.searchQuery);
  const [submittedQuery, setSubmittedQuery] = useState(storedState.submittedQuery);
  const [category, setCategoryState] = useState(storedState.category);
  const [filters, setFiltersState] = useState<SearchFilters>(storedState.filters);
  const [page, setPageState] = useState(storedState.page);

  const { data: preferenceData } = usePreferenceOptions();
  const topics = preferenceData?.topics ?? [];

  const isSearchMode = submittedQuery.trim().length >= 2;
  const effectiveQuery = isSearchMode
    ? submittedQuery.trim()
    : (TOPIC_SEARCH_QUERIES[category] ?? 'science research');

  // O TanStack Query substitui o sessionCache + AbortController manuais: cacheia por
  // chave, deduplica e cancela requisições obsoletas via `signal` nativamente.
  const query = useQuery({
    queryKey: ['catalog', buildResultKey(submittedQuery, category), page, filters],
    queryFn: ({ signal }) => searchCatalogItems(effectiveQuery, page, filters, signal),
    staleTime: CATALOG_TTL,
    gcTime: CATALOG_TTL,
  });

  // Persiste o estado de navegação (texto, categoria, filtros, página) para sobreviver ao F5.
  useEffect(() => {
    setStoredState({ searchQuery, submittedQuery, category, filters, page });
  }, [category, filters, page, searchQuery, setStoredState, submittedQuery]);

  // Apenas atualiza o texto — não dispara busca.
  const setSearchQuery = (q: string) => setSearchQueryState(q);

  // Dispara a busca explicitamente (Enter ou botão). A query refaz ao mudar a key.
  const submitSearch = () => {
    setSubmittedQuery(searchQuery.trim());
    setPageState(0);
  };

  // Limpa a busca e volta ao modo navegação da categoria atual.
  const clearSearch = () => {
    setSearchQueryState('');
    setSubmittedQuery('');
    setPageState(0);
  };

  const setCategory = (catId: string) => {
    setCategoryState(catId);
    setSearchQueryState('');
    setSubmittedQuery('');
    setPageState(0);
  };

  const setFilters = (nextFilters: SearchFilters) => {
    setFiltersState(nextFilters);
    setPageState(0);
  };

  const setPage = (pg: number) => setPageState(pg);

  const resetCatalogHome = useCallback(() => {
    setSearchQueryState(DEFAULT_CATALOG_STATE.searchQuery);
    setSubmittedQuery(DEFAULT_CATALOG_STATE.submittedQuery);
    setCategoryState(DEFAULT_CATALOG_STATE.category);
    setFiltersState(DEFAULT_CATALOG_STATE.filters);
    setPageState(DEFAULT_CATALOG_STATE.page);
  }, []);

  const total = query.data?.total ?? 0;

  return {
    searchQuery,
    setSearchQuery,
    submitSearch,
    clearSearch,
    category,
    setCategory,
    filters,
    setFilters,
    page,
    setPage,
    items: query.data?.items ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    isSearchMode,
    submittedQuery,
    topics,
    refetch: () => query.refetch(),
    resetCatalogHome,
  };
};
