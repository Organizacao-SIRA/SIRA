import { createContext, useContext } from 'react';
import type { useSearchSession } from '../app/useSearchSession';

export type SearchContextValue = ReturnType<typeof useSearchSession>;

export const SearchContext = createContext<SearchContextValue | null>(null);

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch precisa estar dentro de <SearchProvider>');
  return ctx;
};
