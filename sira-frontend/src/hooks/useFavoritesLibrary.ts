import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchFavorites, type FavoriteTypeFilter } from '../services/api';
import { usePersistedState } from './usePersistedState';
import { createSessionCache } from '../utils/sessionCache';
import { useFavorites } from '../queries/useFavorites';
import type { CatalogItem } from '../types';

export const FAVORITES_PAGE_SIZE = 20;

export const FAVORITE_TABS = [
  { id: 'all' },
  { id: 'book' },
  { id: 'article' },
] as const;

export type FavoriteTabId = typeof FAVORITE_TABS[number]['id'];
export type FavoriteCounts = Record<FavoriteTabId, number>;

const FAVORITES_VERSION = 'v1';
const FAVORITES_STATE_KEY = `@sira:favorites:${FAVORITES_VERSION}:state`;
const EMPTY_COUNTS: FavoriteCounts = { all: 0, book: 0, article: 0 };
const EMPTY_ITEMS: CatalogItem[] = [];

interface FavoritesStoredState {
  activeTab: FavoriteTabId;
}

interface FavoritesSnapshot {
  activeTab: FavoriteTabId;
  counts: FavoriteCounts;
  items: CatalogItem[];
  loading: boolean;
  page: number;
  total: number;
  totalPages: number;
}

interface FavoritesCacheEntry {
  counts: FavoriteCounts;
  items: CatalogItem[];
  page: number;
  total: number;
  totalPages: number;
}

const favoritesCache = createSessionCache<FavoritesCacheEntry>({
  namespace: 'favorites',
  version: FAVORITES_VERSION,
  ttlMs: 2 * 60 * 1000,
  maxEntries: 12,
});

const isFavoriteTab = (value: unknown): value is FavoriteTabId =>
  value === 'all' || value === 'book' || value === 'article';

const validateFavoritesState = (value: unknown): FavoritesStoredState => {
  const parsed = value as Partial<FavoritesStoredState>;
  return { activeTab: isFavoriteTab(parsed?.activeTab) ? parsed.activeTab : 'all' };
};

const cacheKeyFor = (tab: FavoriteTabId) => `tab:${tab}`;

const readInitialSnapshot = (state: FavoritesStoredState): FavoritesSnapshot => {
  const hit = favoritesCache.get(cacheKeyFor(state.activeTab));
  if (hit) {
    return {
      activeTab: state.activeTab,
      counts: hit.counts,
      items: hit.items,
      loading: false,
      page: hit.page,
      total: hit.total,
      totalPages: hit.totalPages,
    };
  }

  return {
    activeTab: state.activeTab,
    counts: EMPTY_COUNTS,
    items: [],
    loading: true,
    page: 0,
    total: 0,
    totalPages: 0,
  };
};

export const useFavoritesLibrary = () => {
  const [storedState, setStoredState] = usePersistedState<FavoritesStoredState>(
    FAVORITES_STATE_KEY,
    { activeTab: 'all' },
    { validate: validateFavoritesState },
  );
  // Conjunto global de IDs favoritos (já carregado pela navegação anterior).
  // `knownEmpty` = sabemos, sem fetch próprio, que a biblioteca está vazia —
  // o que permite ir direto ao empty state sem o skeleton piscar antes.
  const { favoriteIds, favoritesLoaded } = useFavorites();
  const knownEmpty = favoritesLoaded && favoriteIds.size === 0;

  const [initialSnapshot] = useState(() => readInitialSnapshot(storedState));
  const [activeTab, setActiveTabState] = useState<FavoriteTabId>(initialSnapshot.activeTab);
  const [items, setItems] = useState<CatalogItem[]>(initialSnapshot.items);
  const [counts, setCounts] = useState<FavoriteCounts>(initialSnapshot.counts);
  const [page, setPage] = useState(initialSnapshot.page);
  const [total, setTotal] = useState(initialSnapshot.total);
  const [totalPages, setTotalPages] = useState(initialSnapshot.totalPages);
  const [isInitialLoading, setIsInitialLoading] = useState(initialSnapshot.loading);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    setStoredState({ activeTab });
  }, [activeTab, setStoredState]);

  const storeSnapshot = useCallback((
    tab: FavoriteTabId,
    nextItems: CatalogItem[],
    nextCounts: FavoriteCounts,
    nextPage: number,
    nextTotal: number,
    nextTotalPages: number,
  ) => {
    favoritesCache.set(cacheKeyFor(tab), {
      counts: nextCounts,
      items: nextItems,
      page: nextPage,
      total: nextTotal,
      totalPages: nextTotalPages,
    });
  }, []);

  const loadFavoritesPage = useCallback(async (
    tab: FavoriteTabId,
    nextPage: number,
    append = false,
    signal?: AbortSignal,
  ) => {
    const hasCachedItems = !append && itemsRef.current.length > 0;

    if (append) setIsLoadingMore(true);
    else if (!hasCachedItems) {
      setIsInitialLoading(true);
      setItems([]);
      setPage(0);
      setTotal(0);
      setTotalPages(0);
    }
    setError(null);

    try {
      const data = await fetchFavorites({
        page: nextPage,
        limit: FAVORITES_PAGE_SIZE,
        type: tab as FavoriteTypeFilter,
        signal,
      });

      const nextItems = append ? [...itemsRef.current, ...data.items] : data.items;
      setItems(nextItems);
      setCounts(data.counts);
      setPage(data.page);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      storeSnapshot(tab, nextItems, data.counts, data.page, data.total, data.totalPages);
    } catch (err: unknown) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : 'Erro ao carregar favoritos');
    } finally {
      if (!signal?.aborted) {
        setIsInitialLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [storeSnapshot]);

  useEffect(() => {
    // Já sabemos que não há favoritos (conjunto global de IDs vazio): não dispara
    // o fetch. O estado "vazio" é derivado no return — sem setState aqui, o que
    // evita o skeleton e mantém o efeito sem efeitos colaterais de estado. O
    // efeito re-roda quando `knownEmpty` muda (ex.: o 1º favorito é adicionado).
    if (knownEmpty) return;

    const controller = new AbortController();
    let isActive = true;

    queueMicrotask(() => {
      if (isActive) void loadFavoritesPage(activeTab, 0, false, controller.signal);
    });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [activeTab, loadFavoritesPage, knownEmpty]);

  const setActiveTab = (tab: FavoriteTabId) => {
    const hit = favoritesCache.get(cacheKeyFor(tab));
    setActiveTabState(tab);

    if (hit) {
      setItems(hit.items);
      setCounts(hit.counts);
      setPage(hit.page);
      setTotal(hit.total);
      setTotalPages(hit.totalPages);
      setIsInitialLoading(false);
      setError(null);
    } else {
      setItems([]);
      setPage(0);
      setTotal(0);
      setTotalPages(0);
      setIsInitialLoading(true);
    }
  };

  const removeFavoriteLocally = (item: CatalogItem) => {
    const nextItems = itemsRef.current.filter(favorite => favorite.id !== item.id);
    const nextTotal = Math.max(0, total - 1);
    const nextCounts = {
      ...counts,
      all: Math.max(0, counts.all - 1),
      ...(item.type === 'book' || item.type === 'article'
        ? { [item.type]: Math.max(0, counts[item.type] - 1) }
        : {}),
    };

    setItems(nextItems);
    setTotal(nextTotal);
    setCounts(nextCounts);
    storeSnapshot(activeTab, nextItems, nextCounts, page, nextTotal, totalPages);

    if (activeTab !== 'all') favoritesCache.remove(cacheKeyFor('all'));
    if ((item.type === 'book' || item.type === 'article') && activeTab !== item.type) {
      favoritesCache.remove(cacheKeyFor(item.type));
    }
  };

  const resetFavoritesHome = useCallback(() => {
    const hit = favoritesCache.get(cacheKeyFor('all'));
    setActiveTabState('all');
    setError(null);

    if (hit) {
      setItems(hit.items);
      setCounts(hit.counts);
      setPage(hit.page);
      setTotal(hit.total);
      setTotalPages(hit.totalPages);
      setIsInitialLoading(false);
    } else if (activeTab !== 'all') {
      setItems([]);
      setCounts(EMPTY_COUNTS);
      setPage(0);
      setTotal(0);
      setTotalPages(0);
      setIsInitialLoading(true);
    } else if (itemsRef.current.length === 0) {
      setIsInitialLoading(true);
    }

    if (activeTab === 'all') {
      void loadFavoritesPage('all', 0, false);
    }
  }, [activeTab, loadFavoritesPage]);

  // Quando os IDs globais garantem que a biblioteca está vazia, expõe o estado
  // "vazio" derivado (sem skeleton e sem esperar o fetch próprio). O estado
  // interno fica intocado e volta a valer assim que `knownEmpty` deixa de ser
  // verdade. `error` também é mascarado: um conjunto vazio é sucesso conhecido.
  return {
    activeTab,
    setActiveTab,
    items: knownEmpty ? EMPTY_ITEMS : items,
    counts: knownEmpty ? EMPTY_COUNTS : counts,
    page: knownEmpty ? 0 : page,
    total: knownEmpty ? 0 : total,
    totalPages: knownEmpty ? 0 : totalPages,
    isInitialLoading: knownEmpty ? false : isInitialLoading,
    isLoadingMore,
    error: knownEmpty ? null : error,
    loadFavoritesPage,
    removeFavoriteLocally,
    resetFavoritesHome,
  };
};
