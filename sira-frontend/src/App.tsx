import { useState, useEffect, useRef } from 'react';
import type { ProfileData, SearchFilters } from './types';
import { 
  searchAcademicContent, 
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
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Onboarding } from './pages/Onboarding';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { useAuth } from './contexts/AuthContext';

export default function App() {
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
  const [results, setResults] = useState<any[]>(() => {
    const saved = sessionStorage.getItem('@sira:results');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTotal, setSearchTotal] = useState(() => {
    const saved = sessionStorage.getItem('@sira:searchTotal');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [aiMessage, setAiMessage] = useState(() => sessionStorage.getItem('@sira:aiMessage') || '');
  const [searchPage, setSearchPage] = useState(() => {
    const saved = sessionStorage.getItem('@sira:searchPage');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [selectedItem, setSelectedItem] = useState<any>(() => {
    const saved = sessionStorage.getItem('@sira:selectedItem');
    return saved ? JSON.parse(saved) : null;
  });
  const [lastSearchScreen, setLastSearchScreen] = useState<'home' | 'results'>(() =>
    (sessionStorage.getItem('@sira:lastSearchScreen') as 'home' | 'results') || 'home'
  );
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(() => {
    const saved = sessionStorage.getItem('@sira:searchFilters');
    return saved ? JSON.parse(saved) : { types: [], area: null, openAccessOnly: false, yearFrom: null };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    window.matchMedia('(min-width: 768px)').matches
  );
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(isAuthenticated);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlScreen = params.get('screen');
    const urlToken = params.get('token');
    if (urlScreen === 'reset-password' && urlToken) {
      return urlToken;
    }
    return sessionStorage.getItem('@sira:resetToken') || '';
  });
  const mainRef = useRef<HTMLElement>(null);

  // Sincroniza as mudanças de estado com o sessionStorage
  useEffect(() => { sessionStorage.setItem('@sira:currentScreen', currentScreen); }, [currentScreen]);
  useEffect(() => { sessionStorage.setItem('@sira:previousScreen', previousScreen); }, [previousScreen]);
  useEffect(() => { sessionStorage.setItem('@sira:searchQuery', searchQuery); }, [searchQuery]);
  useEffect(() => { sessionStorage.setItem('@sira:results', JSON.stringify(results)); }, [results]);
  useEffect(() => { sessionStorage.setItem('@sira:searchTotal', searchTotal.toString()); }, [searchTotal]);
  useEffect(() => { sessionStorage.setItem('@sira:aiMessage', aiMessage); }, [aiMessage]);
  useEffect(() => { sessionStorage.setItem('@sira:searchPage', searchPage.toString()); }, [searchPage]);
  useEffect(() => {
    if (selectedItem) sessionStorage.setItem('@sira:selectedItem', JSON.stringify(selectedItem));
    else sessionStorage.removeItem('@sira:selectedItem');
  }, [selectedItem]);
  useEffect(() => { sessionStorage.setItem('@sira:lastSearchScreen', lastSearchScreen); }, [lastSearchScreen]);
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

  // Restaura posição de scroll ao voltar para os resultados
  useEffect(() => {
    if (currentScreen === 'results') {
      const savedY = sessionStorage.getItem('@sira:resultsScrollY');
      if (savedY && mainRef.current) {
        requestAnimationFrame(() => {
          if (mainRef.current) mainRef.current.scrollTop = parseInt(savedY, 10);
        });
      }
    }
  }, [currentScreen]);

  // Integração com History API do browser (habilita o botão voltar do navegador)
  const AUTH_SCREENS = ['login', 'register', 'onboarding', 'forgot-password', 'reset-password'];
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
    name: user?.name || '',
    email: user?.email || '',
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
    avatarUrl: user?.avatarUrl ?? null,
    hasCompletedOnboarding: user?.hasCompletedOnboarding ?? false,
    onboardingCompletedAt: null,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      // Sincroniza dados básicos do auth imediatamente
      setProfileData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        hasCompletedOnboarding: user.hasCompletedOnboarding ?? prev.hasCompletedOnboarding,
      }));

      // Busca dados completos do perfil
      setIsProfileLoading(true);
      Promise.all([loadFavoriteIds(), loadProfile()])
        .finally(() => {
          setIsProfileLoading(false);
        });
    } else if (!isAuthenticated) {
      setFavoriteIds(new Set());
      setProfileData({
        name: '', email: '', course: '', educationLevel: 'Graduação',
        mainArea: '', subAreas: '', languages: ['Português'],
        materialLevels: ['Intermediário'], wantsBooks: true, wantsArticles: true, wantsOpenAccessOnly: false,
        interests: [], academicGoal: '', avatarUrl: null,
        hasCompletedOnboarding: false, onboardingCompletedAt: null,
      });
      setIsProfileLoading(false);
      setIsProfileLoaded(false);
      // Estado de busca pertence à sessão do usuário — limpa ao deslogar
      setSearchQuery('');
      setResults([]);
      setAiMessage('');
      setSearchTotal(0);
      setSearchPage(0);
      setSelectedItem(null);
      setLastSearchScreen('home');
      setPreviousScreen('home');
      setSearchFilters({ types: [], area: null, openAccessOnly: false, yearFrom: null });
    }
  }, [isAuthenticated, user?.id, user?.hasCompletedOnboarding]);

  useEffect(() => {
    if (!isAuthenticated) {
      const publicScreens = ['register', 'forgot-password', 'reset-password'];
      if (!publicScreens.includes(currentScreen)) setCurrentScreen('login');
      return;
    }

    if (isProfileLoading) return;
    // profileData ainda não sincronizou com o usuário recém-logado
    if (user && !profileData.email) return;

    // Lógica de redirecionamento baseada em fatos (profileData finalizado)
    const authScreens = ['login', 'register', 'onboarding'];
    if (authScreens.includes(currentScreen)) {
      if (profileData.hasCompletedOnboarding) {
        setCurrentScreen('home');
      } else if (currentScreen !== 'onboarding') {
        setCurrentScreen('onboarding');
      }
    }
  }, [isAuthenticated, isProfileLoading, profileData.hasCompletedOnboarding, profileData.email, currentScreen, user]);

  const loadProfile = async () => {
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
        hasCompletedOnboarding: data.hasCompletedOnboarding ?? false,
        onboardingCompletedAt: data.onboardingCompletedAt || null,
      }));
      setIsProfileLoaded(true);
      if (data.avatarUrl !== undefined) updateUser({ avatarUrl: data.avatarUrl });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const loadFavoriteIds = async () => {
    try {
      const data = await fetchFavoriteIds();
      setFavoriteIds(new Set(data));
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const handleSearch = async (e: any) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setCurrentScreen('results');
    setSearchPage(0);
    try {
      const { aiMessage: msg, results: items } = await chatSearchMaterials(searchQuery, searchFilters);
      setResults(items);
      setAiMessage(msg);
      setSearchTotal(items.length);
    } catch {
      setResults([]);
      setAiMessage('Desculpe, tive um erro ao processar sua busca conversacional.');
      setSearchTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchPage = async (page: number) => {
    setIsLoading(true);
    setSearchPage(page);
    try {
      const { items, total } = await searchAcademicContent(searchQuery, page, searchFilters);
      setResults(items);
      setSearchTotal(total);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const viewDetails = (item: any) => {
    if (mainRef.current) {
      sessionStorage.setItem('@sira:resultsScrollY', String(mainRef.current.scrollTop));
    }
    setPreviousScreen(currentScreen);
    setSelectedItem(item);
    setCurrentScreen('details');
  };

  const toggleFavorite = async (item: any) => {
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
      } else {
        await addFavorite(item);
      }
      setFavoriteError(null);
      return true;
    } catch (error: any) {
      console.error('Erro ao alternar favorito:', error);
      setFavoriteError(error?.message || 'Erro desconhecido ao favoritar');
      setTimeout(() => setFavoriteError(null), 5000);
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

  const isFavorite = (id: any) => favoriteIds.has(id);

  const handleSidebarNavigation = (screen: string) => {
    if (screen === 'home') {
      if (currentScreen === 'home') return;
      if (currentScreen === 'results') {
        // Dentro da seção de busca: resultados → input
        setLastSearchScreen('home');
        setCurrentScreen('home');
        return;
      }
      // Vindo de outra aba → restaurar exatamente onde o usuário estava
      setCurrentScreen(lastSearchScreen);
    } else {
      // Saindo da seção de busca → memorizar onde estávamos e salvar scroll
      if (currentScreen === 'home' || currentScreen === 'results') {
        setLastSearchScreen(currentScreen as 'home' | 'results');
        if (currentScreen === 'results' && mainRef.current) {
          sessionStorage.setItem('@sira:resultsScrollY', String(mainRef.current.scrollTop));
        }
      }
      setCurrentScreen(screen);
    }
  };

  const showSidebar = !['login', 'register', 'onboarding', 'forgot-password', 'reset-password'].includes(currentScreen);

  if (isProfileLoading && isAuthenticated && (currentScreen === 'login' || currentScreen === 'register')) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-surface-muted">
        <Navbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          setCurrentScreen={setCurrentScreen}
          currentScreen={currentScreen}
          user={user}
          onLogout={logout}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto" />
            <p className="mt-4 text-primary-dark dark:text-text font-bold text-xs uppercase tracking-widest">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface-muted">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-primary focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Pular para o conteúdo principal
      </a>
      {favoriteError && (
        <div className="fixed top-4 right-4 z-50 bg-danger-soft border border-danger-border text-danger-strong px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-3 animate-fadeIn">
          <span>Erro ao favoritar: {favoriteError}</span>
          <button
            type="button"
            onClick={() => setFavoriteError(null)}
            aria-label="Fechar alerta de erro"
            className="text-danger-strong hover:opacity-70 font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-strong/40 rounded px-1"
          >
            ×
          </button>
        </div>
      )}
      <Navbar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setCurrentScreen={setCurrentScreen} // Navbar mantém o reset absoluto
        currentScreen={currentScreen}
        user={user}
        onLogout={logout}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {showSidebar && (
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            currentScreen={currentScreen}
            setCurrentScreen={handleSidebarNavigation} // Sidebar usa navegação inteligente
            user={user}
          />
        )}

        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="flex-1 overflow-y-auto w-full relative [scrollbar-gutter:stable] focus:outline-none"
        >
          {isLoading && currentScreen !== 'results' && (
            <div className="absolute inset-0 bg-surface/80 z-50 flex flex-col items-center justify-center">
              <Spinner size="lg" />
              <p className="mt-4 text-primary-dark dark:text-text font-bold text-xs uppercase tracking-widest">Buscando...</p>
            </div>
          )}

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
              user={user}
            />
          )}
          {currentScreen === 'details' && (
            <Details item={selectedItem} setCurrentScreen={setCurrentScreen} previousScreen={previousScreen} toggleFavorite={toggleFavorite} isFavorite={isFavorite} />
          )}
          {currentScreen === 'catalog' && (
            <Catalog viewDetails={viewDetails} toggleFavorite={toggleFavorite} isFavorite={isFavorite} />
          )}
          {currentScreen === 'favorites' && (
            <Favorites toggleFavorite={toggleFavorite} viewDetails={viewDetails} setCurrentScreen={setCurrentScreen} />
          )}
          {currentScreen === 'profile' && (
            <Profile profileData={profileData} setProfileData={setProfileData} isLoading={isProfileLoading || !isProfileLoaded} />
          )}
          {currentScreen === 'login' && <Login setCurrentScreen={setCurrentScreen} />}
          {currentScreen === 'register' && <Register setCurrentScreen={setCurrentScreen} />}
          {currentScreen === 'forgot-password' && <ForgotPassword setCurrentScreen={setCurrentScreen} />}
          {currentScreen === 'reset-password' && <ResetPassword token={resetToken} setCurrentScreen={setCurrentScreen} />}
          {currentScreen === 'onboarding' && (
            <Onboarding setCurrentScreen={setCurrentScreen} profileData={profileData} setProfileData={setProfileData} />
          )}
        </main>
      </div>
    </div>
  );
}
