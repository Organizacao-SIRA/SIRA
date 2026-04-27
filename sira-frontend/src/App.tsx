import { useState, useEffect } from 'react';
import {
  searchAcademicContent,
  loginUser,
  registerUser,
  getFavorites,
  addFavorite,
  removeFavorite,
} from './services/api';
import type { AuthUser } from './types';
import { Home } from './pages/Home';
import { Recommendations } from './pages/Recommendations';
import { AiRecommendations } from './pages/AiRecommendations';
import { Favorites } from './pages/Favorites';
import { Profile } from './pages/Profile';
import { Catalog } from './pages/Catalog';
import { Details } from './pages/Details';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [previousScreen, setPreviousScreen] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    course: '',
    educationLevel: '',
    mainArea: '',
    subAreas: '',
    languages: ['Português'],
    materialLevels: ['Intermediário'],
    wantsBooks: true,
    wantsArticles: true,
  });

  // Restaura sessão ao iniciar
  useEffect(() => {
    const token = localStorage.getItem('sira_token');
    const savedUser = localStorage.getItem('sira_user');
    if (token && savedUser) {
      const parsedUser: AuthUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setProfileData(prev => ({ ...prev, name: parsedUser.name || '', email: parsedUser.email }));
      loadFavorites();
    }
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch {
      // token pode ter expirado — não bloqueia a app
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const data = await loginUser(email, password);
    localStorage.setItem('sira_token', data.token);
    localStorage.setItem('sira_user', JSON.stringify(data.user));
    setUser(data.user);
    setProfileData(prev => ({ ...prev, name: data.user.name || '', email: data.user.email }));
    await loadFavorites();
    setCurrentScreen('home');
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    const data = await registerUser(name, email, password);
    localStorage.setItem('sira_token', data.token);
    localStorage.setItem('sira_user', JSON.stringify(data.user));
    setUser(data.user);
    setProfileData(prev => ({ ...prev, name: data.user.name || '', email: data.user.email }));
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('sira_token');
    localStorage.removeItem('sira_user');
    setUser(null);
    setFavorites([]);
    setProfileData({
      name: '',
      email: '',
      course: '',
      educationLevel: '',
      mainArea: '',
      subAreas: '',
      languages: ['Português'],
      materialLevels: ['Intermediário'],
      wantsBooks: true,
      wantsArticles: true,
    });
    setCurrentScreen('home');
  };

  const handleSearch = async (e: any) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setCurrentScreen('results');
    try {
      const data = await searchAcademicContent(searchQuery);
      setResults(data);
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

    if (!user) {
      // Sem autenticação: comportamento local
      setFavorites(prev =>
        isFav ? prev.filter(f => f.id !== item.id) : [...prev, item],
      );
      return;
    }

    try {
      if (isFav) {
        await removeFavorite(item.id);
        setFavorites(prev => prev.filter(f => f.id !== item.id));
      } else {
        await addFavorite(item);
        setFavorites(prev => [...prev, item]);
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
    }
  };

  const isFavorite = (id: any) => favorites.some(f => f.id === id);

  const showSidebar = currentScreen !== 'login' && currentScreen !== 'register';

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setCurrentScreen={setCurrentScreen}
        currentScreen={currentScreen}
        user={user}
        onLogout={handleLogout}
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
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1351B4]"></div>
              <p className="mt-4 text-[#003157] font-bold text-xs uppercase tracking-widest">Buscando...</p>
            </div>
          )}

          {currentScreen === 'home' && (
            <Home searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch} />
          )}
          {currentScreen === 'results' && (
            <Recommendations searchQuery={searchQuery} results={results} viewDetails={viewDetails} toggleFavorite={toggleFavorite} isFavorite={isFavorite} />
          )}
          {currentScreen === 'ai-recommendations' && (
            <AiRecommendations user={user} viewDetails={viewDetails} toggleFavorite={toggleFavorite} isFavorite={isFavorite} setCurrentScreen={setCurrentScreen} />
          )}
          {currentScreen === 'details' && (
            <Details item={selectedItem} setCurrentScreen={setCurrentScreen} previousScreen={previousScreen} toggleFavorite={toggleFavorite} isFavorite={isFavorite} />
          )}
          {currentScreen === 'catalog' && <Catalog viewDetails={viewDetails} />}
          {currentScreen === 'favorites' && (
            <Favorites favorites={favorites} toggleFavorite={toggleFavorite} viewDetails={viewDetails} setCurrentScreen={setCurrentScreen} />
          )}
          {currentScreen === 'profile' && (
            <Profile profileData={profileData} setProfileData={setProfileData} />
          )}
          {currentScreen === 'login' && (
            <Login setCurrentScreen={setCurrentScreen} onLogin={handleLogin} />
          )}
          {currentScreen === 'register' && (
            <Register setCurrentScreen={setCurrentScreen} onRegister={handleRegister} />
          )}
        </main>
      </div>
    </div>
  );
}
