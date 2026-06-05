import type { ReactNode } from 'react';
import { useSearchSession } from '../app/useSearchSession';
import { SearchContext } from './SearchContext';

/**
 * Mantém a sessão de busca conversacional (query, resultados, filtros) viva
 * enquanto o usuário transita entre `/` (input) e `/buscar` (resultados).
 *
 * Monta apenas dentro da área autenticada (AppShell), então o estado é
 * naturalmente descartado no logout (desmontagem) — sem reset manual.
 */
export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const search = useSearchSession();
  return <SearchContext.Provider value={search}>{children}</SearchContext.Provider>;
};
