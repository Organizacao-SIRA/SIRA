import { useState, useEffect, useRef, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { CatalogItem, ProfileData, SearchFilters } from './types';
import { 
  chatSearchMaterials, 
  fetchFavoriteIds, 
  addFavorite, 
  removeFavoriteApi, 
  getProfile 
} from './services/api';
import { Home } from './pages/Home';
import { Recommendations } from './pages/Recommendations';
import { Favorites } from './pages/Favorites';
import { Profile } from './pages/Profile';
import { Catalog } from './pages/Catalog';
import { Details } from './pages/Details';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Spinner } from './components/ui/Spinner';
import { ErrorState } from './components/ui/ErrorState';
import { PageErrorBoundary } from './components/ui/PageErrorBoundary';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Onboarding } from './pages/Onboarding';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { useAuth } from './contexts/AuthContext';
import { useScreenScrollRestoration } from './hooks/useScreenScrollRestoration';
import { DEFAULT_LOCALE } from './i18n/locales';
import { toast } from './toast';

const SCREEN_SCROLL_KEYS: Record<string, string> = {
  results: '@sira:resultsScrollY',
  catalog: '@sira:catalogScrollY',
  favorites: '@sira:favoritesScrollY',
};
const RESET_SCROLL_SCREENS = ['details'];
const AUTH_SCREENS = ['login', 'register', 'onboarding', 'forgot-password', 'reset-password'];
const PUBLIC_SCREENS = ['register', 'forgot-password', 'reset-password'];
const SCREENS_WITHOUT_SIDEBAR = new Set(['login', 'register', 'onboarding', 'forgot-password', 'reset-password']);
type SearchSectionScreen = 'home' | 'results' | 'details';
type SearchDetailOrigin = 'home' | 'results';
type CatalogSectionScreen = 'catalog' | 'details';
type FavoritesSectionScreen = 'favorites' | 'details';

const isSearchSectionScreen = (screen: string): screen is SearchSectionScreen =>
  screen === 'home' || screen === 'results' || screen === 'details';
const isSearchDetailOrigin = (screen: string): screen is SearchDetailOrigin =>
  screen === 'home' || screen === 'results';
const isCatalogSectionScreen = (screen: string): screen is CatalogSectionScreen =>
  screen === 'catalog' || screen === 'details';
const isFavoritesSectionScreen = (screen: string): screen is FavoritesSectionScreen =>
  screen === 'favorites' || screen === 'details';

const readLastSearchScreen = (): SearchSectionScreen => {
  const stored = sessionStorage.getItem('@sira:lastSearchScreen');
  return isSearchSectionScreen(stored ?? '') ? stored as SearchSectionScreen : 'home';
};

const readSearchDetailOrigin = (): SearchDetailOrigin => {
  const stored = sessionStorage.getItem('@sira:searchDetailOrigin');
  return isSearchDetailOrigin(stored ?? '') ? stored as SearchDetailOrigin : 'results';
};
const readLastCatalogScreen = (): CatalogSectionScreen => {
  const stored = sessionStorage.getItem('@sira:lastCatalogScreen');
  return isCatalogSectionScreen(stored ?? '') ? stored as CatalogSectionScreen : 'catalog';
};
const readLastFavoritesScreen = (): FavoritesSectionScreen => {
  const stored = sessionStorage.getItem('@sira:lastFavoritesScreen');
  return isFavoritesSectionScreen(stored ?? '') ? stored as FavoritesSectionScreen : 'favorites';
};

const readCatalogItemArray = (key: string): CatalogItem[] => {
  const saved = sessionStorage.getItem(key);
  return saved ? JSON.parse(saved) as CatalogItem[] : [];
};

const readCatalogItem = (key: string): CatalogItem | null => {
  const saved = sessionStorage.getItem(key);
  return saved ? JSON.parse(saved) as CatalogItem : null;
};

const createEmptyProfileData = (): ProfileData => ({
  name: '',
  email: '',
  course: '',
  educationLevel: 'Graduação',
  mainArea: '',
  subAreas: '',
  languages: ['Português'],
  materialLevels: ['Intermediário'],
  wantsBooks: true,
  wantsArticles: true,
  wantsOpenAccessOnly: false,
  interests: [],
  academicGoal: '',
  avatarUrl: null,
  uiLocale: DEFAULT_LOCALE,
  hasCompletedOnboarding: false,
  onboardingCompletedAt: null,
});

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
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('@sira:searchQuery') || '');
  const [results, setResults] = useState<CatalogItem[]>(() => readCatalogItemArray('@sira:results'));
  const [searchTotal, setSearchTotal] = useState(() => {
    const saved = sessionStorage.getItem('@sira:searchTotal');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [aiMessage, setAiMessage] = useState(() => sessionStorage.getItem('@sira:aiMessage') || '');
  const [seenResultIds, setSeenResultIds] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('@sira:seenResultIds');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchPage, setSearchPage] = useState(() => {
    const saved = sessionStorage.getItem('@sira:searchPage');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(() => readCatalogItem('@sira:selectedItem'));
  const [searchDetailItem, setSearchDetailItem] = useState<CatalogItem | null>(() => readCatalogItem('@sira:searchDetailItem'));
  const [searchDetailOrigin, setSearchDetailOrigin] = useState<SearchDetailOrigin>(readSearchDetailOrigin);
  const [lastSearchScreen, setLastSearchScreen] = useState<SearchSectionScreen>(readLastSearchScreen);
  const [catalogDetailItem, setCatalogDetailItem] = useState<CatalogItem | null>(() => readCatalogItem('@sira:catalogDetailItem'));
  const [favoritesDetailItem, setFavoritesDetailItem] = useState<CatalogItem | null>(() => readCatalogItem('@sira:favoritesDetailItem'));
  const [lastCatalogScreen, setLastCatalogScreen] = useState<CatalogSectionScreen>(readLastCatalogScreen);
  const [lastFavoritesScreen, setLastFavoritesScreen] = useState<FavoritesSectionScreen>(readLastFavoritesScreen);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(() => {
    const saved = sessionStorage.getItem('@sira:searchFilters');
    return saved ? JSON.parse(saved) : { types: [], area: null, openAccessOnly: false, yearFrom: null };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    window.matchMedia('(min-width: 768px)').matches
  );
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(isAuthenticated);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [catalogHomeResetKey, setCatalogHomeResetKey] = useState(0);
  const [favoritesHomeResetKey, setFavoritesHomeResetKey] = useState(0);
  const searchRequestInFlightRef = useRef(false);
  const regenerateRequestInFlightRef = useRef(false);
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
  useEffect(() => { sessionStorage.setItem('@sira:searchQuery', searchQuery); }, [searchQuery]);
  useEffect(() => { sessionStorage.setItem('@sira:results', JSON.stringify(results)); }, [results]);
  useEffect(() => { sessionStorage.setItem('@sira:searchTotal', searchTotal.toString()); }, [searchTotal]);
  useEffect(() => { sessionStorage.setItem('@sira:aiMessage', aiMessage); }, [aiMessage]);
  useEffect(() => { sessionStorage.setItem('@sira:seenResultIds', JSON.stringify(seenResultIds)); }, [seenResultIds]);
  useEffect(() => { sessionStorage.setItem('@sira:searchPage', searchPage.toString()); }, [searchPage]);
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
  useEffect(() => { sessionStorage.setItem('@sira:searchFilters', JSON.stringify(searchFilters)); }, [searchFilters]);
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

  const [profileData, setProfileData] = useState<ProfileData>({
    ...createEmptyProfileData(),
    name: user?.name ?? '',
    email: user?.email ?? '',
    avatarUrl: user?.avatarUrl ?? null,
    uiLocale: user?.uiLocale ?? DEFAULT_LOCALE,
    hasCompletedOnboarding: user?.hasCompletedOnboarding ?? false,
  });
  const authUserId = user?.id;
  const authUserName = user?.name;
  const authUserEmail = user?.email;
  const authUserHasCompletedOnboarding = user?.hasCompletedOnboarding;
  const authUserUiLocale = user?.uiLocale;

  const loadProfile = useCallback(async () => {
    try {
      const data = await getProfile();
      setProfileData(prev => ({
        ...prev,
        name: data.name || prev.name,
        email: data.email || prev.email,
        course: data.course || '',
        educationLevel: data.educationLevel || 'Graduação',
        mainArea: data.mainArea || '',
        subAreas: data.subAreas || '',
        languages: data.languages?.length ? data.languages : ['Português'],
        materialLevels: data.materialLevels?.length ? data.materialLevels : ['Intermediário'],
        wantsBooks: data.wantsBooks ?? true,
        wantsArticles: data.wantsArticles ?? true,
        wantsOpenAccessOnly: data.wantsOpenAccessOnly ?? false,
        interests: data.interests || [],
        academicGoal: data.academicGoal || '',
        avatarUrl: data.avatarUrl ?? null,
        uiLocale: data.uiLocale ?? DEFAULT_LOCALE,
        hasCompletedOnboarding: data.hasCompletedOnboarding ?? false,
        onboardingCompletedAt: data.onboardingCompletedAt || null,
      }));
      setProfileError(null);
      if (data.avatarUrl !== undefined || data.uiLocale !== undefined) {
        updateUser({
          ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
          ...(data.uiLocale !== undefined ? { uiLocale: data.uiLocale } : {}),
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      const message = error instanceof Error ? error.message : 'Erro ao carregar perfil';
      setProfileError(message);
    }
  }, [updateUser]);

  const loadFavoriteIds = useCallback(async () => {
    try {
      const data = await fetchFavoriteIds();
      setFavoriteIds(new Set(data));
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  }, []);

  const loadSessionData = useCallback(() => {
    setIsProfileLoading(true);
    setProfileError(null);
    Promise.all([loadFavoriteIds(), loadProfile()])
      .finally(() => {
        setIsProfileLoading(false);
      });
  }, [loadFavoriteIds, loadProfile]);

  useEffect(() => {
    let isActive = true;

    queueMicrotask(() => {
      if (!isActive) return;

      if (isAuthenticated && authUserId) {
        // Sincroniza dados básicos do auth imediatamente
        setProfileData(prev => ({
          ...prev,
          name: authUserName || prev.name,
          email: authUserEmail || prev.email,
          hasCompletedOnboarding: authUserHasCompletedOnboarding ?? prev.hasCompletedOnboarding,
          uiLocale: authUserUiLocale ?? prev.uiLocale,
        }));

        loadSessionData();
      } else if (!isAuthenticated) {
        setFavoriteIds(new Set());
        setProfileData(createEmptyProfileData());
        setIsProfileLoading(false);
        setProfileError(null);
        // Estado de busca pertence à sessão do usuário — limpa ao deslogar
        setSearchQuery('');
        setResults([]);
        setAiMessage('');
        setSeenResultIds([]);
        setSearchTotal(0);
        setSearchPage(0);
        setSelectedItem(null);
        setLastSearchScreen('home');
        setPreviousScreen('home');
        setSearchFilters({ types: [], area: null, openAccessOnly: false, yearFrom: null });
      }
    });

    return () => {
      isActive = false;
    };
  }, [
    isAuthenticated,
    authUserEmail,
    authUserHasCompletedOnboarding,
    authUserId,
    authUserName,
    authUserUiLocale,
    loadSessionData,
  ]);

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

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isLoading || isRegenerating || searchRequestInFlightRef.current || regenerateRequestInFlightRef.current) return;
    searchRequestInFlightRef.current = true;
    setIsLoading(true);
    setCurrentScreen('results');
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
  };

  const regenerateSearchResults = async () => {
    if (!searchQuery.trim() || isLoading || isRegenerating || searchRequestInFlightRef.current || regenerateRequestInFlightRef.current) return;
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
  };

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

  const toggleFavorite = async (item: CatalogItem) => {
    const isFav = favoriteIds.has(item.id);

    // Optimistic update — feedback imediato antes da resposta da API
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (isFav) next.delete(item.id);
      else next.add(item.id);
      return next;
    });

    try {
      if (isFav) {
        await removeFavoriteApi(item.id);
        toast.success(t('toast.favoriteRemoved'));
      } else {
        await addFavorite(item);
        toast.success(t('toast.favoriteAdded'));
      }
      return true;
    } catch (error: unknown) {
      console.error('Erro ao alternar favorito:', error);
      toast.error(t('errors.favoriteAlert', { message: error instanceof Error ? error.message : t('errors.unknownFavorite') }));
      // Rollback em caso de falha
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (isFav) next.add(item.id);
        else next.delete(item.id);
        return next;
      });
      return false;
    }
  };

  const isFavorite = (id: string) => favoriteIds.has(id);

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
              <p className="mt-4 text-primary-dark dark:text-text font-bold text-xs uppercase tracking-widest">Buscando...</p>
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
            {currentScreen === 'home' && (
              <Home searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch} filters={searchFilters} setFilters={setSearchFilters} user={user} />
            )}
            {currentScreen === 'results' && (
              <Recommendations
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
                setCurrentScreen={setCurrentScreen}
                results={results}
                aiMessage={aiMessage}
                viewDetails={viewDetails}
                toggleFavorite={toggleFavorite}
                isFavorite={isFavorite}
                isLoading={isLoading}
                isRegenerating={isRegenerating}
                onRegenerate={regenerateSearchResults}
                isSidebarOpen={isSidebarOpen}
                user={user}
              />
            )}
            {currentScreen === 'details' && (
              <Details item={selectedItem} onBack={handleDetailsBack} previousScreen={previousScreen} toggleFavorite={toggleFavorite} isFavorite={isFavorite} />
            )}
            {currentScreen === 'catalog' && (
              <Catalog
                viewDetails={viewDetails}
                toggleFavorite={toggleFavorite}
                isFavorite={isFavorite}
                homeResetKey={catalogHomeResetKey}
              />
            )}
            {currentScreen === 'favorites' && (
              <Favorites
                toggleFavorite={toggleFavorite}
                viewDetails={viewDetails}
                setCurrentScreen={setCurrentScreen}
                homeResetKey={favoritesHomeResetKey}
              />
            )}
            {currentScreen === 'profile' && (
              <Profile
                profileData={profileData}
                setProfileData={setProfileData}
                isLoading={isProfileLoading}
                loadError={profileError}
                onRetryLoad={loadSessionData}
              />
            )}
            {currentScreen === 'login' && <Login setCurrentScreen={setCurrentScreen} />}
            {currentScreen === 'register' && <Register setCurrentScreen={setCurrentScreen} />}
            {currentScreen === 'forgot-password' && <ForgotPassword setCurrentScreen={setCurrentScreen} />}
            {currentScreen === 'reset-password' && <ResetPassword token={resetToken} setCurrentScreen={setCurrentScreen} />}
            {currentScreen === 'onboarding' && (
              <Onboarding setCurrentScreen={setCurrentScreen} profileData={profileData} setProfileData={setProfileData} />
            )}
          </PageErrorBoundary>
        </main>
      </div>
    </div>
  );
}
