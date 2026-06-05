import { useCallback, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { chatSearchMaterials } from '../services/api';
import { usePersistedState } from '../hooks/usePersistedState';
import type { CatalogItem, SearchFilters } from '../types';

const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  types: [],
  area: null,
  openAccessOnly: false,
  yearFrom: null,
};

export const useSearchSession = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  // Persistência via `usePersistedState` (estratégia única do projeto) para
  // sobreviver ao F5 e à navegação entre `/` e `/buscar`.
  const [searchQuery, setSearchQuery] = usePersistedState<string>('@sira:searchQuery', '');
  const [results, setResults] = usePersistedState<CatalogItem[]>('@sira:results', []);
  const [aiMessage, setAiMessage] = usePersistedState<string>('@sira:aiMessage', '');
  const [seenResultIds, setSeenResultIds] = usePersistedState<string[]>('@sira:seenResultIds', []);
  const [searchFilters, setSearchFilters] = usePersistedState<SearchFilters>('@sira:searchFilters', DEFAULT_SEARCH_FILTERS);

  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const searchRequestInFlightRef = useRef(false);
  const regenerateRequestInFlightRef = useRef(false);

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
    try {
      const { aiMessage: msg, results: items } = await chatSearchMaterials(searchQuery, searchFilters);
      setResults(items);
      setAiMessage(msg);
      setSeenResultIds(items.map(item => item.id).filter(Boolean));
    } catch {
      setResults([]);
      setAiMessage(t('errors.conversationalSearch'));
      setSeenResultIds([]);
    } finally {
      setIsLoading(false);
      searchRequestInFlightRef.current = false;
    }
  }, [isLoading, isRegenerating, navigate, searchFilters, searchQuery, setAiMessage, setResults, setSeenResultIds, t]);

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
      setSeenResultIds(prev => [...new Set([...prev, ...items.map(item => item.id).filter(Boolean)])]);
    } catch {
      setAiMessage(t('errors.regenerateSearch'));
    } finally {
      setIsRegenerating(false);
      regenerateRequestInFlightRef.current = false;
    }
  }, [isLoading, isRegenerating, results, searchFilters, searchQuery, seenResultIds, setAiMessage, setResults, setSeenResultIds, t]);

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
  };
};
