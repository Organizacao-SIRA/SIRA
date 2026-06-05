import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { AuthUser } from '../types';
import { SidebarNavItem } from './ui/SidebarNavItem';
import { SIDEBAR_ITEMS } from './sidebar/sidebarItems';
import { prefetchScreen } from '../app/screenLoaders';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  currentScreen: string;
  previousScreen: string;
  setCurrentScreen: (screen: string) => void;
  user: AuthUser | null;
}

export const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  currentScreen,
  previousScreen,
  setCurrentScreen,
  user,
}: SidebarProps) => {
  const { t } = useTranslation('navigation');
  const menuItems = SIDEBAR_ITEMS.filter(item => !item.authRequired || !!user);
  const activeScreen = currentScreen === 'details'
    ? previousScreen === 'results' ? 'home' : previousScreen
    : currentScreen === 'results' ? 'home' : currentScreen;

  const isActive = (id: string) => activeScreen === id;

  // Em mobile (< md), navegar fecha o drawer; em desktop, mantém o estado atual.
  const handleItemClick = (id: string) => {
    setCurrentScreen(id);
    if (window.matchMedia('(max-width: 767px)').matches) {
      setIsSidebarOpen(false);
    }
  };

  // Esc fecha o drawer em mobile.
  useEffect(() => {
    if (!isSidebarOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && window.matchMedia('(max-width: 767px)').matches) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isSidebarOpen, setIsSidebarOpen]);

  return (
    <>
      {/* Backdrop — apenas em mobile, fecha o drawer ao clicar */}
      {isSidebarOpen && (
        <div
          aria-hidden="true"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 top-[68px] bg-black/40 backdrop-blur-[2px] z-30 md:hidden animate-fadeIn"
        />
      )}

      <aside
        aria-label={t('menu.sidebar')}
        aria-modal={isSidebarOpen ? 'true' : undefined}
        role={isSidebarOpen ? 'dialog' : undefined}
        className={`
          flex-shrink-0 flex flex-col
          bg-surface border-r border-border-strong
          transition-transform duration-300 ease-in-out md:transition-all
          absolute md:relative z-40
          h-[calc(100vh-68px)] md:h-auto md:min-h-[calc(100vh-68px)]
          shadow-lg md:shadow-none
          overflow-hidden
          ${isSidebarOpen
            ? 'w-72 max-w-[85vw] translate-x-0'
            : 'w-72 max-w-[85vw] -translate-x-full md:w-16 md:translate-x-0'
          }
        `}
      >
        {/* Cabeçalho visível apenas em mobile */}
        <div className="p-4 border-b border-border bg-surface-muted flex justify-between items-center md:hidden">
          <span className="font-bold text-primary-dark dark:text-text">{t('menu.title')}</span>
          <button
            aria-label={t('menu.close')}
            onClick={() => setIsSidebarOpen(false)}
            className="cursor-pointer text-text-muted hover:text-danger-strong text-2xl leading-none w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-subtle transition-colors"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="sira-scrollbar flex-1 py-4 overflow-y-auto" aria-label={t('menu.mainNavigation')}>
          <ul className="space-y-1">
            {menuItems.map(item => (
              <SidebarNavItem
                key={item.id}
                item={item}
                isActive={isActive(item.id)}
                isExpanded={isSidebarOpen}
                onClick={() => handleItemClick(item.id)}
                onPrefetch={() => prefetchScreen(item.id)}
              />
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};
