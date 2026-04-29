import { Library, Sparkles, Bookmark, UserCircle, Settings } from 'lucide-react';
import type { AuthUser } from '../types';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  user: AuthUser | null;
}

export const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  currentScreen,
  setCurrentScreen,
  user,
}: SidebarProps) => {

  const menuItems = [
    { id: 'catalog', label: 'Catálogo de Livros', icon: Library },
    { id: 'home', label: 'Recomendações', icon: Sparkles },
    { id: 'favorites', label: 'Meus Favoritos', icon: Bookmark },
    ...(user ? [{ id: 'profile', label: 'Meu Perfil', icon: UserCircle }] : []),
    { id: 'onboarding', label: 'Preferências', icon: Settings },
  ];

  return (
    <aside
      className={`${
        isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'
      } absolute md:relative z-40 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 flex flex-col shadow-lg md:shadow-none min-h-[calc(100vh-68px)]`}
    >
      {/* Cabeçalho do Menu para Mobile */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center md:hidden">
        <span className="font-bold text-[#003157]">Menu Principal</span>
        <button onClick={() => setIsSidebarOpen(false)} className="cursor-pointer text-gray-500 hover:text-red-500 text-2xl">
          &times;
        </button>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id ||
              (item.id === 'home' && (currentScreen === 'results' || currentScreen === 'details'));
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setCurrentScreen(item.id);
                    if (window.innerWidth < 768) setIsSidebarOpen(false); 
                  }}
                  className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-[#F2F5FD] text-[#1351B4] border-l-4 border-[#1351B4]' 
                      : 'text-gray-700 hover:bg-gray-100 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-[#1351B4]' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};