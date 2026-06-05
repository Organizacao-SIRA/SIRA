import { useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ErrorState } from '../components/ui/ErrorState';
import { PageErrorBoundary } from '../components/ui/PageErrorBoundary';
import { SearchProvider } from '../contexts/SearchProvider';

export interface AppShellOutletContext {
  isSidebarOpen: boolean;
}

/**
 * Casca da área autenticada com sidebar: Navbar + Sidebar + conteúdo roteado.
 * Substitui o layout que vivia no antigo `App.tsx`. A sessão de busca é provida
 * aqui para sobreviver à navegação entre `/` e `/buscar`.
 */
export const AppShell = () => {
  const { t } = useTranslation('common');
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    window.matchMedia('(min-width: 768px)').matches,
  );
  const mainRef = useRef<HTMLElement>(null);

  return (
    <SearchProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-surface-muted">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-link focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-focus"
        >
          {t('states.skipToContent')}
        </a>
        <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

          <main
            id="main-content"
            ref={mainRef}
            tabIndex={-1}
            className="sira-scrollbar flex-1 overflow-y-auto w-full relative [scrollbar-gutter:stable] focus:outline-none"
          >
            <PageErrorBoundary
              resetKey={location.pathname}
              fallback={
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-68px)] flex items-center">
                  <ErrorState
                    title={t('states.errorTitle')}
                    message={t('states.errorDescription')}
                    onRetry={() => window.location.reload()}
                  />
                </div>
              }
            >
              <Outlet context={{ isSidebarOpen } satisfies AppShellOutletContext} />
            </PageErrorBoundary>
          </main>
        </div>
      </div>
    </SearchProvider>
  );
};
