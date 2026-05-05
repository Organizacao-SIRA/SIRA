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
  const [currentScreen, setCurrentScreen] = useState('home');
  const [previousScreen, setPreviousScreen] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [results, setResults] = useState<any[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(0);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [profileData, setProfileData] = useState({
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
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
      loadProfile();
    } else {
      setFavorites([]);
      setProfileData({
        name: '', email: '', course: '', educationLevel: 'Graduação',
        mainArea: '', subAreas: '', languages: ['Português'],
        materialLevels: ['Intermediário'], wantsBooks: true, wantsArticles: true,
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && currentScreen !== 'register') {
      setCurrentScreen('login');
    } else if (isAuthenticated && (currentScreen === 'login' || currentScreen === 'register')) {
      setCurrentScreen('home');
    }
  }, [isAuthenticated, currentScreen]);

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

  const showSidebar = !['login', 'register', 'onboarding', 'interests'].includes(currentScreen);

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

      <div className="flex flex-1 overflow-hidden relative">
        {showSidebar && (
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
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
            <Recommendations searchQuery={searchQuery} results={results} total={searchTotal} page={searchPage} onPageChange={handleSearchPage} viewDetails={viewDetails} toggleFavorite={toggleFavorite} isFavorite={isFavorite} isLoading={isLoading} />
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
