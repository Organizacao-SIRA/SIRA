import { useState } from 'react';
import { searchAcademicContent } from './services/api';
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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [previousScreen, setPreviousScreen] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tipagem 'any[]' evita os erros vermelhos de "never" que vimos na foto
  const [results, setResults] = useState<any[]>([]); 
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [profileData, setProfileData] = useState({
    name: 'Ricardo Almeida',
    email: 'ricardo.almeida@email.com',
    course: 'Ciências da Computação',
    educationLevel: 'Mestrado',
    mainArea: 'Inteligência Artificial',
    subAreas: 'Machine Learning, PLN',
    languages: ['Português', 'Inglês'],
    materialLevels: ['Intermediário'],
    wantsBooks: true,
    wantsArticles: true
  });

  const handleSearch = async (e: any) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setCurrentScreen('results');
    try {
      const data = await searchAcademicContent(searchQuery);
      setResults(data);
    } catch (error) {
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

  const toggleFavorite = (item: any) => {
    setFavorites(prev => {
      const isFav = prev.some(f => f.id === item.id);
      return isFav ? prev.filter(f => f.id !== item.id) : [...prev, item];
    });
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
      />

      <div className="flex flex-1 overflow-hidden relative">
        {showSidebar && (
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen} // Resolve o erro vermelho da Sidebar
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
          />
        )}

        <main className="flex-1 overflow-y-auto w-full relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1351B4]"></div>
              <p className="mt-4 text-[#003157] font-bold text-xs uppercase tracking-widest">Buscando...</p>
            </div>
          )}

          {currentScreen === 'home' && <Home searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch} />}
          {currentScreen === 'results' && <Recommendations searchQuery={searchQuery} results={results} viewDetails={viewDetails} toggleFavorite={toggleFavorite} isFavorite={isFavorite} />}
          {currentScreen === 'details' && <Details item={selectedItem} setCurrentScreen={setCurrentScreen} previousScreen={previousScreen} toggleFavorite={toggleFavorite} isFavorite={isFavorite} />}
          {currentScreen === 'catalog' && <Catalog viewDetails={viewDetails} />}
          {currentScreen === 'favorites' && <Favorites favorites={favorites} toggleFavorite={toggleFavorite} viewDetails={viewDetails} setCurrentScreen={setCurrentScreen} />}
          {currentScreen === 'profile' && <Profile profileData={profileData} setProfileData={setProfileData} />}
          {currentScreen === 'login' && <Login setCurrentScreen={setCurrentScreen} />}
          {currentScreen === 'register' && <Register setCurrentScreen={setCurrentScreen} />}
        </main>
      </div>
    </div>
  );
}