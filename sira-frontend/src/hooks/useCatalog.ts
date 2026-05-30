import { useState, useEffect, useRef, useCallback } from 'react';
import { searchCatalogItems, TOPIC_SEARCH_QUERIES, getPreferenceOptions } from '../services/api';
import { usePersistedState } from './usePersistedState';
import { createSessionCache } from '../utils/sessionCache';
import type { CatalogItem, PreferenceTopic, SearchFilters } from '../types';

const PAGE_SIZE = 10;
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

interface CatalogSnapshot extends CatalogStoredState {
  items: CatalogItem[];
  total: number;
  loading: boolean;
}

interface CatalogResult {
  items: CatalogItem[];
  total: number;
}

const DEFAULT_CATALOG_STATE: CatalogStoredState = {
  searchQuery: '',
  submittedQuery: '',
  category: 'all',
  filters: DEFAULT_FILTERS,
  page: 0,
};

const catalogCache = createSessionCache<CatalogResult>({
  namespace: 'catalog',
  version: CATALOG_VERSION,
  ttlMs: 15 * 60 * 1000,
  maxEntries: 50,
});

const normalizeFilters = (filters: any): SearchFilters => ({
  types: Array.isArray(filters?.types) ? filters.types : [],
  area: typeof filters?.area === 'string' ? filters.area : null,
  openAccessOnly: Boolean(filters?.openAccessOnly),
  yearFrom: typeof filters?.yearFrom === 'number' ? filters.yearFrom : null,
});

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

const buildFilterKey = (filters: SearchFilters) =>
  [
    filters.types.join(',') || 'all-types',
    filters.area ?? 'all-areas',
    filters.openAccessOnly ? 'oa' : 'all-access',
    filters.yearFrom ?? 'all-years',
  ].join(':');

const buildResultKey = (query: string, categoryId: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length >= 2) return `search:${encodeURIComponent(normalizedQuery)}`;
  return `browse:${categoryId}`;
};

const buildCacheKey = (query: string, categoryId: string, page: number, filters: SearchFilters = DEFAULT_FILTERS) =>
  `${buildResultKey(query, categoryId)}:p${page}:${buildFilterKey(filters)}`;

const readInitialSnapshot = (state: CatalogStoredState): CatalogSnapshot => {
  const hit = catalogCache.get(buildCacheKey(state.submittedQuery, state.category, state.page, state.filters));
  if (hit) return { ...state, items: hit.items, total: hit.total, loading: false };
  return { ...state, items: [], total: 0, loading: true };
};

export const useCatalog = () => {
  const [storedState, setStoredState] = usePersistedState<CatalogStoredState>(
    CATALOG_STATE_KEY,
    DEFAULT_CATALOG_STATE,
    { validate: validateCatalogState },
  );
  const [initialSnapshot] = useState(() => readInitialSnapshot(storedState));
  const [searchQuery, setSearchQueryState] = useState(initialSnapshot.searchQuery);
  const [category, setCategoryState] = useState(initialSnapshot.category);
  const [filters, setFiltersState] = useState<SearchFilters>(initialSnapshot.filters);
  const [page, setPageState] = useState(initialSnapshot.page);
  const [items, setItems] = useState<CatalogItem[]>(initialSnapshot.items);
  const [total, setTotal] = useState(initialSnapshot.total);
  const [loading, setLoading] = useState(initialSnapshot.loading);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<PreferenceTopic[]>([]);

  // Tracks the query that was actually submitted (used for labels/isSearchMode)
  const [submittedQuery, setSubmittedQuery] = useState(initialSnapshot.submittedQuery);

  const abortRef = useRef<AbortController | null>(null);
  // Refs to avoid stale closures in imperative handlers
  const searchRef = useRef(searchQuery);
  const submittedQueryRef = useRef(submittedQuery);
  const categoryRef = useRef(category);
  const filtersRef = useRef(filters);
  searchRef.current = searchQuery;
  submittedQueryRef.current = submittedQuery;
  categoryRef.current = category;
  filtersRef.current = filters;

  const doFetch = useCallback(async (query: string, catId: string, pg: number, activeFilters: SearchFilters) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const isSearch = query.trim().length >= 2;
    const effectiveQuery = isSearch
      ? query.trim()
      : (TOPIC_SEARCH_QUERIES[catId] ?? 'science research');

    const cacheKey = buildCacheKey(isSearch ? query : '', catId, pg, activeFilters);
    const hit = catalogCache.get(cacheKey);
    if (hit) {
      setItems(hit.items);
      setTotal(hit.total);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await searchCatalogItems(effectiveQuery, pg, activeFilters, abortRef.current.signal);
      setItems(result.items);
      setTotal(result.total);
      catalogCache.set(cacheKey, result);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message ?? 'Erro ao carregar materiais');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getPreferenceOptions()
      .then(opts => setTopics(opts.topics))
      .catch(() => {});
    // Se o cache já populou o estado inicial, não busca novamente.
    if (!initialSnapshot.loading) return;
    doFetch(initialSnapshot.submittedQuery, initialSnapshot.category, initialSnapshot.page, initialSnapshot.filters);
  }, [doFetch]);

  useEffect(() => {
    setStoredState({
      searchQuery,
      submittedQuery,
      category,
      filters,
      page,
    });
  }, [category, filters, page, searchQuery, setStoredState, submittedQuery]);

  // Apenas atualiza o texto — não dispara busca
  const setSearchQuery = (q: string) => {
    setSearchQueryState(q);
  };

  // Dispara a busca explicitamente (Enter ou botão)
  const submitSearch = () => {
    const q = searchRef.current.trim();
    setPageState(0);
    setSubmittedQuery(q);
    doFetch(q, categoryRef.current, 0, filtersRef.current);
  };

  // Limpa a busca e volta ao modo browse da categoria atual
  const clearSearch = () => {
    setSearchQueryState('');
    setSubmittedQuery('');
    setPageState(0);
    doFetch('', categoryRef.current, 0, filtersRef.current);
  };

  const setCategory = (catId: string) => {
    setCategoryState(catId);
    setPageState(0);
    setSearchQueryState('');
    setSubmittedQuery('');
    doFetch('', catId, 0, filtersRef.current);
  };

  const setFilters = (nextFilters: SearchFilters) => {
    setFiltersState(nextFilters);
    setPageState(0);
    doFetch(submittedQueryRef.current, categoryRef.current, 0, nextFilters);
  };

  const setPage = (pg: number) => {
    setPageState(pg);
    doFetch(submittedQueryRef.current, categoryRef.current, pg, filtersRef.current);
  };

  const refetch = () => doFetch(submittedQueryRef.current, categoryRef.current, page, filtersRef.current);

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
    items,
    loading,
    error,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    isSearchMode: submittedQuery.length >= 2,
    submittedQuery,
    topics,
    refetch,
  };
};
