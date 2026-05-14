import { useState, useEffect, useRef, useCallback } from 'react';
import { searchCatalogItems, TOPIC_SEARCH_QUERIES, getPreferenceOptions } from '../services/api';
import type { CatalogItem, PreferenceTopic } from '../types';

const PAGE_SIZE = 10;

const CACHE_VERSION = 'v4';
const buildCacheKey = (categoryId: string, page: number) =>
  `@sira:catalog:${CACHE_VERSION}:${categoryId}:p${page}`;

const readInitialCache = (): { items: CatalogItem[]; total: number; loading: boolean } => {
  try {
    const hit = sessionStorage.getItem(buildCacheKey('all', 0));
    if (hit) {
      const parsed = JSON.parse(hit);
      return { items: parsed.items, total: parsed.total, loading: false };
    }
  } catch {}
  return { items: [], total: 0, loading: true };
};

export const useCatalog = () => {
  const [searchQuery, setSearchQueryState] = useState('');
  const [category, setCategoryState] = useState('all');
  const [page, setPageState] = useState(0);
  const [{ items: initialItems, total: initialTotal, loading: initialLoading }] = useState(readInitialCache);
  const [items, setItems] = useState<CatalogItem[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<PreferenceTopic[]>([]);

  // Tracks the query that was actually submitted (used for labels/isSearchMode)
  const [submittedQuery, setSubmittedQuery] = useState('');

  const abortRef = useRef<AbortController | null>(null);
  // Refs to avoid stale closures in imperative handlers
  const searchRef = useRef(searchQuery);
  const categoryRef = useRef(category);
  searchRef.current = searchQuery;
  categoryRef.current = category;

  const doFetch = useCallback(async (query: string, catId: string, pg: number) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const isSearch = query.trim().length >= 2;
    const effectiveQuery = isSearch
      ? query.trim()
      : (TOPIC_SEARCH_QUERIES[catId] ?? 'science research');

    if (!isSearch) {
      const cacheKey = buildCacheKey(catId, pg);
      const hit = sessionStorage.getItem(cacheKey);
      if (hit) {
        try {
          const { items: ci, total: ct } = JSON.parse(hit);
          setItems(ci);
          setTotal(ct);
          setLoading(false);
          setError(null);
          return;
        } catch {}
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await searchCatalogItems(effectiveQuery, pg, abortRef.current.signal);
      setItems(result.items);
      setTotal(result.total);
      if (!isSearch) {
        sessionStorage.setItem(buildCacheKey(catId, pg), JSON.stringify(result));
      }
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
    // Se o cache já populou o estado inicial, não busca novamente
    if (!initialLoading) return;
    doFetch('', 'all', 0);
  }, [doFetch]);

  // Apenas atualiza o texto — não dispara busca
  const setSearchQuery = (q: string) => {
    setSearchQueryState(q);
  };

  // Dispara a busca explicitamente (Enter ou botão)
  const submitSearch = () => {
    const q = searchRef.current.trim();
    setPageState(0);
    setSubmittedQuery(q);
    doFetch(q, categoryRef.current, 0);
  };

  // Limpa a busca e volta ao modo browse da categoria atual
  const clearSearch = () => {
    setSearchQueryState('');
    setSubmittedQuery('');
    setPageState(0);
    doFetch('', categoryRef.current, 0);
  };

  const setCategory = (catId: string) => {
    setCategoryState(catId);
    setPageState(0);
    setSearchQueryState('');
    setSubmittedQuery('');
    doFetch('', catId, 0);
  };

  const setPage = (pg: number) => {
    setPageState(pg);
    doFetch(searchRef.current, categoryRef.current, pg);
  };

  const refetch = () => doFetch(searchRef.current, categoryRef.current, page);

  return {
    searchQuery,
    setSearchQuery,
    submitSearch,
    clearSearch,
    category,
    setCategory,
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
