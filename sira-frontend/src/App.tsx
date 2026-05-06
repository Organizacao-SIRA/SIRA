import { useState, useEffect } from 'react';
import { searchAcademicContent, fetchFavorites, addFavorite, removeFavoriteApi, getProfile } from './services/api';
import { Home } from './pages/Home';
import { Recommendations } from './pages/Recommendations';
import { Favorites } from './pages/Favorites';
import { Profile } from './pages/Profile';
import { Catalog } from './pages/Catalog';
import { Details } from './pages/Details';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Onboarding } from './pages/Onboarding';
import { Interests } from './pages/Interests';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { isAuthenticated, user, logout } = useAuth();
  
  // Estados persistidos via sessionStorage para sobreviver a reloads (F5)
  const [currentScreen, setCurrentScreen] = useState(() => sessionStorage.getItem('@sira:currentScreen') || 'home');
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
  const [searchPage, setSearchPage] = useState(() => {
    const saved = sessionStorage.getItem('@sira:searchPage');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [selectedItem, setSelectedItem] = useState<any>(() => {
    const saved = sessionStorage.getItem('@sira:selectedItem');
    return saved ? JSON.parse(saved) : null;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(isAuthenticated);

  // Sincroniza as mudanças de estado com o sessionStorage
  useEffect(() => { sessionStorage.setItem('@sira:currentScreen', currentScreen); }, [currentScreen]);
  useEffect(() => { sessionStorage.setItem('@sira:previousScreen', previousScreen); }, [previousScreen]);
  useEffect(() => { sessionStorage.setItem('@sira:searchQuery', searchQuery); }, [searchQuery]);
  useEffect(() => { sessionStorage.setItem('@sira:results', JSON.stringify(results)); }, [results]);
  useEffect(() => { sessionStorage.setItem('@sira:searchTotal', searchTotal.toString()); }, [searchTotal]);
  useEffect(() => { sessionStorage.setItem('@sira:searchPage', searchPage.toString()); }, [searchPage]);
  useEffect(() => { 
    if (selectedItem) sessionStorage.setItem('@sira:selectedItem', JSON.stringify(selectedItem));
    else sessionStorage.removeItem('@sira:selectedItem');
  }, [selectedItem]);

  const [profileData, setProfileData] = useState({
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
    interests: [] as string[],
    academicGoal: '',
    hasCompletedOnboarding: user?.hasCompletedOnboarding ?? false,
    onboardingCompletedAt: null as string | null,
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
      Promise.all([loadFavorites(), loadProfile()])
        .finally(() => {
          setIsProfileLoading(false);
        });
    } else if (!isAuthenticated) {
      setFavorites([]);
      setProfileData({
        name: '', email: '', course: '', educationLevel: 'Graduação',
        mainArea: '', subAreas: '', languages: ['Português'],
        materialLevels: ['Intermediário'], wantsBooks: true, wantsArticles: true,
        interests: [], academicGoal: '', hasCompletedOnboarding: false, onboardingCompletedAt: null,
      });
      setIsProfileLoading(false);
    }
  }, [isAuthenticated, user?.id, user?.hasCompletedOnboarding]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (currentScreen !== 'register') setCurrentScreen('login');
      return;
    }

    // Se está autenticado mas carregando o perfil, esperamos
    if (isProfileLoading) return;

    // Lógica de redirecionamento baseada em fatos (profileData finalizado)
    if (currentScreen === 'login' || currentScreen === 'register' || currentScreen === 'onboarding') {
      if (profileData.hasCompletedOnboarding) {
        setCurrentScreen('home');
      } else if (currentScreen !== 'onboarding' && currentScreen !== 'interests') {
        setCurrentScreen('onboarding');
      }
    }
  }, [isAuthenticated, isProfileLoading, profileData.hasCompletedOnboarding, currentScreen]);

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
        interests: data.interests || [],
        academicGoal: data.academicGoal || '',
        hasCompletedOnboarding: data.hasCompletedOnboarding ?? false,
        onboardingCompletedAt: data.onboardingCompletedAt || null,
      }));
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const data = await fetchFavorites();
      setFavorites(data);
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
      const { items, total } = await searchAcademicContent(searchQuery, 0);
      setResults(items);
      setSearchTotal(total);
    } catch {
      setResults([]);
      setSearchTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchPage = async (page: number) => {
    setIsLoading(true);
    setSearchPage(page);
    try {
      const { items, total } = await searchAcademicContent(searchQuery, page);
      setResults(items);
      setSearchTotal(total);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const viewDetails = (item: any) => {
    setPreviousScreen(currentScreen);
    setSelectedItem(item);
    setCurrentScreen('details');
  };

  const toggleFavorite = async (item: any) => {
    const isFav = favorites.some(f => f.id === item.id);

    try {
      if (isFav) {
        await removeFavoriteApi(item.id);
        setFavorites(prev => prev.filter(f => f.id !== item.id));
      } else {
        await addFavorite(item);
        setFavorites(prev => [...prev, item]);
      }
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
    }
  };

  const isFavorite = (id: any) => favorites.some(f => f.id === id);

  const handleSidebarNavigation = (screen: string) => {
    if (screen === 'home') {
      // Se já estiver na aba "Recomendações" (seja IA ou resultados), não faz nada
      if (currentScreen === 'home' || currentScreen === 'results') return;
      // Se tiver uma busca ativa salva, volta para os resultados
      if (results && results.length > 0) {
        setCurrentScreen('results');
      } else {
        setCurrentScreen('home');
      }
    } else {
      setCurrentScreen(screen);
    }
  };

  const showSidebar = !['login', 'register', 'onboarding', 'interests'].includes(currentScreen);

  if (isProfileLoading && isAuthenticated && (currentScreen === 'login' || currentScreen === 'register')) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
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
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-primary-dark font-bold text-xs uppercase tracking-widest">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
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

        <main className="flex-1 overflow-y-auto w-full relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p className="mt-4 text-primary-dark font-bold text-xs uppercase tracking-widest">Buscando...</p>
            </div>
          )}

          {currentScreen === 'home' && (
            <Home searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch} user={user} viewDetails={viewDetails} toggleFavorite={toggleFavorite} isFavorite={isFavorite} setCurrentScreen={setCurrentScreen} />
          )}
          {currentScreen === 'results' && (
            <Recommendations 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              setCurrentScreen={setCurrentScreen}
              results={results} 
              total={searchTotal} 
              page={searchPage} 
              onPageChange={handleSearchPage} 
              viewDetails={viewDetails} 
              toggleFavorite={toggleFavorite} 
              isFavorite={isFavorite} 
              isLoading={isLoading} 
            />
          )}
          {currentScreen === 'details' && (
            <Details item={selectedItem} setCurrentScreen={setCurrentScreen} previousScreen={previousScreen} toggleFavorite={toggleFavorite} isFavorite={isFavorite} />
          )}
          {currentScreen === 'catalog' && (
            <Catalog viewDetails={viewDetails} toggleFavorite={toggleFavorite} isFavorite={isFavorite} />
          )}
          {currentScreen === 'favorites' && (
            <Favorites favorites={favorites} toggleFavorite={toggleFavorite} viewDetails={viewDetails} setCurrentScreen={setCurrentScreen} />
          )}
          {currentScreen === 'profile' && (
            <Profile profileData={profileData} setProfileData={setProfileData} />
          )}
          {currentScreen === 'login' && <Login setCurrentScreen={setCurrentScreen} />}
          {currentScreen === 'register' && <Register setCurrentScreen={setCurrentScreen} />}
          {currentScreen === 'onboarding' && (
            <Onboarding setCurrentScreen={setCurrentScreen} profileData={profileData} setProfileData={setProfileData} />
          )}
          {currentScreen === 'interests' && (
            <Interests setCurrentScreen={setCurrentScreen} profileData={profileData} setProfileData={setProfileData} />
          )}
        </main>
      </div>
    </div>
  );
}
