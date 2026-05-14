import type { AuthUser } from '../types';
import { SidebarNavItem } from './ui/SidebarNavItem';
import { SIDEBAR_ITEMS } from './sidebar/sidebarItems';

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
  const menuItems = SIDEBAR_ITEMS.filter(item => !item.authRequired || !!user);

  const isActive = (id: string) =>
    currentScreen === id ||
    (id === 'home' && (currentScreen === 'results' || currentScreen === 'details'));

  const handleItemClick = (id: string) => {
    setCurrentScreen(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <aside
      aria-label="Menu lateral"
      className={`
        flex-shrink-0 flex flex-col
        bg-surface border-r border-border-strong
        transition-all duration-300 ease-in-out
        absolute md:relative z-40
        min-h-[calc(100vh-68px)] shadow-lg md:shadow-none
        overflow-hidden
        ${isSidebarOpen
          ? 'w-64 translate-x-0'
          : 'w-0 -translate-x-full md:w-16 md:translate-x-0'
        }
      `}
    >
      {/* Cabeçalho visível apenas em mobile */}
      <div className="p-4 border-b border-border bg-surface-muted flex justify-between items-center md:hidden">
        <span className="font-bold text-primary-dark dark:text-text">Menu Principal</span>
        <button
          aria-label="Fechar menu"
          onClick={() => setIsSidebarOpen(false)}
          className="cursor-pointer text-text-muted hover:text-danger-strong text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      <nav className="flex-1 py-4" aria-label="Navegação principal">
        <ul className="space-y-1">
          {menuItems.map(item => (
            <SidebarNavItem
              key={item.id}
              item={item}
              isActive={isActive(item.id)}
              isExpanded={isSidebarOpen}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
};
