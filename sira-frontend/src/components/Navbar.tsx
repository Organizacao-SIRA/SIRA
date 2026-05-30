import { LogIn } from 'lucide-react';
import type { AuthUser } from '../types';
import { resolveAvatarUrl } from '../services/api';
import { Button } from './ui/Button';
import { NavBrand } from './NavBrand';
import { UserProfileChip } from './ui/UserProfileChip';
import { NavLogoutButton } from './NavLogoutButton';
import { ThemeToggle } from './ui/ThemeToggle';

interface NavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  setCurrentScreen: (screen: string) => void;
  currentScreen: string;
  showMenuButton: boolean;
  user: AuthUser | null;
  onLogout: () => void;
}

export const Navbar = ({ isSidebarOpen, setIsSidebarOpen, setCurrentScreen, currentScreen, showMenuButton, user, onLogout }: NavbarProps) => {
  const displayName = user?.name || user?.email || '';

  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-50 w-full transition-all">
      <div className="h-1 w-full bg-gradient-to-r from-success to-accent" />
      <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2 sm:gap-3">

          <NavBrand
            showMenuButton={showMenuButton}
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            onLogoClick={() => setCurrentScreen('home')}
          />

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <ThemeToggle />
            {user ? (
              <>
                <UserProfileChip
                  name={displayName}
                  avatarUrl={resolveAvatarUrl(user.avatarUrl)}
                  onClick={() => setCurrentScreen('profile')}
                />
                <NavLogoutButton onLogout={onLogout} />
              </>
            ) : (
              <Button
                onClick={() => setCurrentScreen('login')}
                variant="navbarAction"
                size="sm"
                disabled={currentScreen === 'login'}
              >
                {currentScreen !== 'login' && <LogIn className="w-4 h-4" />}
                {currentScreen === 'login' ? 'Acessando...' : 'Entrar'}
              </Button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
