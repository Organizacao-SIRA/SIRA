import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { chatSearchMaterials } from '../services/api';
import type { CatalogItem, SearchFilters } from '../types';
import { readCatalogItemArray, readSessionJson } from './appState';

const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  types: [],
  area: null,
  openAccessOnly: false,
  yearFrom: null,
};

const readSessionNumber = (key: string) => {
  const saved = sessionStorage.getItem(key);
  const parsed = saved ? Number.parseInt(saved, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

export const useSearchSession = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('@sira:searchQuery') || '');
  const [results, setResults] = useState<CatalogItem[]>(() => readCatalogItemArray('@sira:results'));
  const [searchTotal, setSearchTotal] = useState(() => readSessionNumber('@sira:searchTotal'));
  const [aiMessage, setAiMessage] = useState(() => sessionStorage.getItem('@sira:aiMessage') || '');
  const [seenResultIds, setSeenResultIds] = useState<string[]>(() => readSessionJson<string[]>('@sira:seenResultIds', []));
  const [searchPage, setSearchPage] = useState(() => readSessionNumber('@sira:searchPage'));
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(() => {
    return readSessionJson<SearchFilters>('@sira:searchFilters', DEFAULT_SEARCH_FILTERS);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const searchRequestInFlightRef = useRef(false);
  const regenerateRequestInFlightRef = useRef(false);

  useEffect(() => { sessionStorage.setItem('@sira:searchQuery', searchQuery); }, [searchQuery]);
  useEffect(() => { sessionStorage.setItem('@sira:results', JSON.stringify(results)); }, [results]);
  useEffect(() => { sessionStorage.setItem('@sira:searchTotal', searchTotal.toString()); }, [searchTotal]);
  useEffect(() => { sessionStorage.setItem('@sira:aiMessage', aiMessage); }, [aiMessage]);
  useEffect(() => { sessionStorage.setItem('@sira:seenResultIds', JSON.stringify(seenResultIds)); }, [seenResultIds]);
  useEffect(() => { sessionStorage.setItem('@sira:searchPage', searchPage.toString()); }, [searchPage]);
  useEffect(() => { sessionStorage.setItem('@sira:searchFilters', JSON.stringify(searchFilters)); }, [searchFilters]);

  const handleSearch = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (
      !searchQuery.trim()
      || isLoading
      || isRegenerating
      || searchRequestInFlightRef.current
      || regenerateRequestInFlightRef.current
    ) {
      return;
    }

    searchRequestInFlightRef.current = true;
    setIsLoading(true);
    navigate('/buscar');
    setSearchPage(0);
    try {
      const { aiMessage: msg, results: items } = await chatSearchMaterials(searchQuery, searchFilters);
      setResults(items);
      setAiMessage(msg);
      setSearchTotal(items.length);
      setSeenResultIds(items.map(item => item.id).filter(Boolean));
    } catch {
      setResults([]);
      setAiMessage(t('errors.conversationalSearch'));
      setSearchTotal(0);
      setSeenResultIds([]);
    } finally {
      setIsLoading(false);
      searchRequestInFlightRef.current = false;
    }
  }, [isLoading, isRegenerating, navigate, searchFilters, searchQuery, t]);

  const regenerateSearchResults = useCallback(async () => {
    if (
      !searchQuery.trim()
      || isLoading
      || isRegenerating
      || searchRequestInFlightRef.current
      || regenerateRequestInFlightRef.current
    ) {
      return;
    }

    regenerateRequestInFlightRef.current = true;

    const excludeIds = [
      ...new Set([
        ...seenResultIds,
        ...results.map(item => item.id).filter(Boolean),
      ]),
    ];

    setIsRegenerating(true);
    try {
      const { aiMessage: msg, results: items } = await chatSearchMaterials(searchQuery, searchFilters, {
        excludeIds,
        diversify: true,
      });
      setResults(items);
      setAiMessage(msg);
      setSearchTotal(items.length);
      setSeenResultIds(prev => [...new Set([...prev, ...items.map(item => item.id).filter(Boolean)])]);
    } catch {
      setAiMessage(t('errors.regenerateSearch'));
    } finally {
      setIsRegenerating(false);
      regenerateRequestInFlightRef.current = false;
    }
  }, [isLoading, isRegenerating, results, searchFilters, searchQuery, seenResultIds, t]);

  const resetSearchSession = useCallback(() => {
    setSearchQuery('');
    setResults([]);
    setAiMessage('');
    setSeenResultIds([]);
    setSearchTotal(0);
    setSearchPage(0);
    setSearchFilters(DEFAULT_SEARCH_FILTERS);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    results,
    aiMessage,
    searchFilters,
    setSearchFilters,
    isLoading,
    isRegenerating,
    handleSearch,
    regenerateSearchResults,
    resetSearchSession,
  };
};
