import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { CatalogItem } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Spinner } from './components/ui/Spinner';
import { ErrorState } from './components/ui/ErrorState';
import { PageErrorBoundary } from './components/ui/PageErrorBoundary';
import { useAuth } from './contexts/AuthContext';
import { useFavorites } from './queries/useFavorites';
import { useScreenScrollRestoration } from './hooks/useScreenScrollRestoration';
import { AppScreen } from './app/AppScreen';
import { useSessionProfile } from './app/useSessionProfile';
import { useSearchSession } from './app/useSearchSession';
import {
  AUTH_SCREENS,
  PUBLIC_SCREENS,
  RESET_SCROLL_SCREENS,
  SCREENS_WITHOUT_SIDEBAR,
  SCREEN_SCROLL_KEYS,
  readCatalogItem,
  readLastCatalogScreen,
  readLastFavoritesScreen,
  readLastSearchScreen,
  readSearchDetailOrigin,
  type CatalogSectionScreen,
  type FavoritesSectionScreen,
  type SearchDetailOrigin,
  type SearchSectionScreen,
} from './app/appState';

export default function App() {
  const { t } = useTranslation('common');
  const { isAuthenticated, user, logout, updateUser } = useAuth();
  
  // Estados persistidos via sessionStorage para sobreviver a reloads (F5)
  const [currentScreen, setCurrentScreen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlScreen = params.get('screen');
    const urlToken = params.get('token');
    if (urlScreen === 'reset-password' && urlToken) {
      return 'reset-password';
    }
    return sessionStorage.getItem('@sira:currentScreen') || 'home';
  });
  const [previousScreen, setPreviousScreen] = useState(() => sessionStorage.getItem('@sira:previousScreen') || 'home');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(() => readCatalogItem('@sira:selectedItem'));
  const [searchDetailItem, setSearchDetailItem] = useState<CatalogItem | null>(() => readCatalogItem('@sira:searchDetailItem'));
  const [searchDetailOrigin, setSearchDetailOrigin] = useState<SearchDetailOrigin>(readSearchDetailOrigin);
  const [lastSearchScreen, setLastSearchScreen] = useState<SearchSectionScreen>(readLastSearchScreen);
  const [catalogDetailItem, setCatalogDetailItem] = useState<CatalogItem | null>(() => readCatalogItem('@sira:catalogDetailItem'));
  const [favoritesDetailItem, setFavoritesDetailItem] = useState<CatalogItem | null>(() => readCatalogItem('@sira:favoritesDetailItem'));
  const [lastCatalogScreen, setLastCatalogScreen] = useState<CatalogSectionScreen>(readLastCatalogScreen);
  const [lastFavoritesScreen, setLastFavoritesScreen] = useState<FavoritesSectionScreen>(readLastFavoritesScreen);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    window.matchMedia('(min-width: 768px)').matches
  );
  const [catalogHomeResetKey, setCatalogHomeResetKey] = useState(0);
  const [favoritesHomeResetKey, setFavoritesHomeResetKey] = useState(0);
  const [resetToken] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlScreen = params.get('screen');
    const urlToken = params.get('token');
    if (urlScreen === 'reset-password' && urlToken) {
      return urlToken;
    }
    return sessionStorage.getItem('@sira:resetToken') || '';
  });
  const mainRef = useRef<HTMLElement>(null);
  const saveScreenScroll = useScreenScrollRestoration(
    mainRef,
    currentScreen,
    SCREEN_SCROLL_KEYS,
    RESET_SCROLL_SCREENS,
  );
  const resetScreenScroll = (screen: string) => {
    const key = SCREEN_SCROLL_KEYS[screen];
    if (key) {
      try {
        sessionStorage.setItem(key, '0');
      } catch {
        // sessionStorage can be unavailable in private browsing modes.
      }
    }

    requestAnimationFrame(() => {
      if (mainRef.current) mainRef.current.scrollTop = 0;
    });
  };

  // Sincroniza as mudanças de estado com o sessionStorage
  useEffect(() => { sessionStorage.setItem('@sira:currentScreen', currentScreen); }, [currentScreen]);
  useEffect(() => { sessionStorage.setItem('@sira:previousScreen', previousScreen); }, [previousScreen]);
  useEffect(() => {
    if (selectedItem) sessionStorage.setItem('@sira:selectedItem', JSON.stringify(selectedItem));
    else sessionStorage.removeItem('@sira:selectedItem');
  }, [selectedItem]);
  useEffect(() => {
    if (searchDetailItem) sessionStorage.setItem('@sira:searchDetailItem', JSON.stringify(searchDetailItem));
    else sessionStorage.removeItem('@sira:searchDetailItem');
  }, [searchDetailItem]);
  useEffect(() => {
    if (catalogDetailItem) sessionStorage.setItem('@sira:catalogDetailItem', JSON.stringify(catalogDetailItem));
    else sessionStorage.removeItem('@sira:catalogDetailItem');
  }, [catalogDetailItem]);
  useEffect(() => {
    if (favoritesDetailItem) sessionStorage.setItem('@sira:favoritesDetailItem', JSON.stringify(favoritesDetailItem));
    else sessionStorage.removeItem('@sira:favoritesDetailItem');
  }, [favoritesDetailItem]);
  useEffect(() => { sessionStorage.setItem('@sira:searchDetailOrigin', searchDetailOrigin); }, [searchDetailOrigin]);
  useEffect(() => { sessionStorage.setItem('@sira:lastSearchScreen', lastSearchScreen); }, [lastSearchScreen]);
  useEffect(() => { sessionStorage.setItem('@sira:lastCatalogScreen', lastCatalogScreen); }, [lastCatalogScreen]);
  useEffect(() => { sessionStorage.setItem('@sira:lastFavoritesScreen', lastFavoritesScreen); }, [lastFavoritesScreen]);
  useEffect(() => {
    if (resetToken) sessionStorage.setItem('@sira:resetToken', resetToken);
    else sessionStorage.removeItem('@sira:resetToken');
  }, [resetToken]);

  // Limpa os parâmetros de recuperação de senha da URL após a montagem do componente
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlScreen = params.get('screen');

    if (urlScreen === 'reset-password' && urlToken) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Integração com History API do browser (habilita o botão voltar do navegador)
  useEffect(() => {
    if (AUTH_SCREENS.includes(currentScreen)) return;
    if (!window.history.state?.screen) {
      window.history.replaceState({ screen: currentScreen }, '');
    } else if (window.history.state.screen !== currentScreen) {
      window.history.pushState({ screen: currentScreen }, '');
    }
  }, [currentScreen]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const target = e.state?.screen;
      if (target) setCurrentScreen(target);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const authUserId = user?.id;
  const {
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
  } = useSearchSession({ setCurrentScreen });

  const resetUserScopedState = useCallback(() => {
    resetSearchSession();
    setSelectedItem(null);
    setLastSearchScreen('home');
    setPreviousScreen('home');
  }, [resetSearchSession]);

  const {
    isProfileLoading,
    profileError,
    profileData,
    setProfileData,
    loadSessionData,
  } = useSessionProfile({
    isAuthenticated,
    user,
    updateUser,
    onLogoutReset: resetUserScopedState,
  });

  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    let isActive = true;

    queueMicrotask(() => {
      if (!isActive) return;

      if (!isAuthenticated) {
        if (!PUBLIC_SCREENS.includes(currentScreen)) setCurrentScreen('login');
        return;
      }

      if (isProfileLoading) return;
      // profileData ainda não sincronizou com o usuário recém-logado
      if (authUserId && !profileData.email) return;

      // Lógica de redirecionamento baseada em fatos (profileData finalizado)
      if (AUTH_SCREENS.includes(currentScreen)) {
        if (profileData.hasCompletedOnboarding) {
          setCurrentScreen('home');
        } else if (currentScreen !== 'onboarding') {
          setCurrentScreen('onboarding');
        }
      }
    });

    return () => {
      isActive = false;
    };
  }, [authUserId, currentScreen, isAuthenticated, isProfileLoading, profileData.email, profileData.hasCompletedOnboarding]);

  const viewDetails = (item: CatalogItem) => {
    saveScreenScroll(currentScreen);
    setPreviousScreen(currentScreen);
    setSelectedItem(item);
    if (currentScreen === 'home' || currentScreen === 'results') {
      setSearchDetailItem(item);
      setSearchDetailOrigin(currentScreen);
      setLastSearchScreen('details');
    } else if (currentScreen === 'catalog') {
      setCatalogDetailItem(item);
      setLastCatalogScreen('details');
    } else if (currentScreen === 'favorites') {
      setFavoritesDetailItem(item);
      setLastFavoritesScreen('details');
    }
    setCurrentScreen('details');
  };

  const restoreSearchSection = () => {
    if (lastSearchScreen !== 'details') {
      setCurrentScreen(lastSearchScreen);
      return;
    }

    if (searchDetailItem) {
      setSelectedItem(searchDetailItem);
      setPreviousScreen(searchDetailOrigin);
      setCurrentScreen('details');
      return;
    }

    const fallbackScreen: SearchSectionScreen = results.length > 0 ? 'results' : 'home';
    setLastSearchScreen(fallbackScreen);
    setCurrentScreen(fallbackScreen);
  };

  const restoreCatalogSection = () => {
    if (lastCatalogScreen === 'details' && catalogDetailItem) {
      setSelectedItem(catalogDetailItem);
      setPreviousScreen('catalog');
      setCurrentScreen('details');
      return;
    }

    setLastCatalogScreen('catalog');
    setCurrentScreen('catalog');
  };

  const restoreFavoritesSection = () => {
    if (lastFavoritesScreen === 'details' && favoritesDetailItem) {
      setSelectedItem(favoritesDetailItem);
      setPreviousScreen('favorites');
      setCurrentScreen('details');
      return;
    }

    setLastFavoritesScreen('favorites');
    setCurrentScreen('favorites');
  };

  const resetCatalogHome = () => {
    resetScreenScroll('catalog');
    setLastCatalogScreen('catalog');
    setCurrentScreen('catalog');
    setCatalogHomeResetKey(key => key + 1);
  };

  const resetFavoritesHome = () => {
    resetScreenScroll('favorites');
    setLastFavoritesScreen('favorites');
    setCurrentScreen('favorites');
    setFavoritesHomeResetKey(key => key + 1);
  };

  const rememberCurrentSection = () => {
    if (currentScreen === 'home' || currentScreen === 'results') {
      setLastSearchScreen(currentScreen);
    } else if (currentScreen === 'catalog') {
      setLastCatalogScreen('catalog');
    } else if (currentScreen === 'favorites') {
      setLastFavoritesScreen('favorites');
    } else if (currentScreen === 'details') {
      if (previousScreen === 'home' || previousScreen === 'results') {
        setLastSearchScreen('details');
      } else if (previousScreen === 'catalog') {
        setLastCatalogScreen('details');
      } else if (previousScreen === 'favorites') {
        setLastFavoritesScreen('details');
      }
    }
  };

  const handleDetailsBack = () => {
    const target = previousScreen || 'home';

    if (target === 'home' || target === 'results') {
      setLastSearchScreen(target);
    } else if (target === 'catalog') {
      setLastCatalogScreen('catalog');
    } else if (target === 'favorites') {
      setLastFavoritesScreen('favorites');
    }

    setCurrentScreen(target);
  };

  const handleSidebarNavigation = (screen: string) => {
    if (screen === 'home') {
      if (currentScreen === 'home') return;
      if (currentScreen === 'results') {
        // Dentro da seção de busca: resultados → input
        saveScreenScroll('results');
        setLastSearchScreen('home');
        setCurrentScreen('home');
        return;
      }
      if (currentScreen === 'details' && (previousScreen === 'home' || previousScreen === 'results')) {
        // Dentro da seção de busca: detalhe → origem do detalhe
        const target = previousScreen === 'results' ? 'results' : 'home';
        setLastSearchScreen(target);
        setCurrentScreen(target);
        return;
      }
      // Vindo de outra aba → restaurar exatamente onde o usuário estava
      restoreSearchSection();
    } else if (screen === 'catalog') {
      if (currentScreen === 'catalog') {
        resetCatalogHome();
        return;
      }
      if (currentScreen === 'details' && previousScreen === 'catalog') {
        setLastCatalogScreen('catalog');
        setCurrentScreen('catalog');
        return;
      }
      rememberCurrentSection();
      saveScreenScroll(currentScreen);
      restoreCatalogSection();
    } else if (screen === 'favorites') {
      if (currentScreen === 'favorites') {
        resetFavoritesHome();
        return;
      }
      if (currentScreen === 'details' && previousScreen === 'favorites') {
        setLastFavoritesScreen('favorites');
        setCurrentScreen('favorites');
        return;
      }
      rememberCurrentSection();
      saveScreenScroll(currentScreen);
      restoreFavoritesSection();
    } else {
      // Saindo da seção de busca → memorizar onde estávamos e salvar scroll
      rememberCurrentSection();
      saveScreenScroll(currentScreen);
      setCurrentScreen(screen);
    }
  };

  const showSidebar = !SCREENS_WITHOUT_SIDEBAR.has(currentScreen);

  if (isProfileLoading && isAuthenticated && (currentScreen === 'login' || currentScreen === 'register')) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-surface-muted">
        <Navbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          setCurrentScreen={setCurrentScreen}
          currentScreen={currentScreen}
          showMenuButton={showSidebar}
          user={user}
          onLogout={logout}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto" />
            <p className="mt-4 text-primary-dark dark:text-text font-bold text-xs uppercase tracking-widest">{t('states.loadingProfile')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface-muted">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-link focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-focus"
      >
        {t('states.skipToContent')}
      </a>
      <Navbar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setCurrentScreen={setCurrentScreen} // Navbar mantém o reset absoluto
        currentScreen={currentScreen}
        showMenuButton={showSidebar}
        user={user}
        onLogout={logout}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {showSidebar && (
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            currentScreen={currentScreen}
            previousScreen={previousScreen}
            setCurrentScreen={handleSidebarNavigation} // Sidebar usa navegação inteligente
            user={user}
          />
        )}

        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="sira-scrollbar flex-1 overflow-y-auto w-full relative [scrollbar-gutter:stable] focus:outline-none"
        >
          {isLoading && currentScreen !== 'results' && (
            <div className="absolute inset-0 bg-surface/80 z-50 flex flex-col items-center justify-center">
              <Spinner size="lg" />
              <p className="mt-4 text-primary-dark dark:text-text font-bold text-xs uppercase tracking-widest">{t('states.searching')}</p>
            </div>
          )}

          <PageErrorBoundary
            resetKey={currentScreen}
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
            <AppScreen
              currentScreen={currentScreen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              searchFilters={searchFilters}
              setSearchFilters={setSearchFilters}
              user={user}
              results={results}
              aiMessage={aiMessage}
              viewDetails={viewDetails}
              toggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
              isLoading={isLoading}
              isRegenerating={isRegenerating}
              regenerateSearchResults={regenerateSearchResults}
              isSidebarOpen={isSidebarOpen}
              selectedItem={selectedItem}
              handleDetailsBack={handleDetailsBack}
              previousScreen={previousScreen}
              catalogHomeResetKey={catalogHomeResetKey}
              favoritesHomeResetKey={favoritesHomeResetKey}
              setCurrentScreen={setCurrentScreen}
              profileData={profileData}
              setProfileData={setProfileData}
              isProfileLoading={isProfileLoading}
              profileError={profileError}
              loadSessionData={loadSessionData}
              resetToken={resetToken}
            />
          </PageErrorBoundary>
        </main>
      </div>
    </div>
  );
}
