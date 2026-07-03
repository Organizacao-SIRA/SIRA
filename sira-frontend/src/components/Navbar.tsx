import { LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { resolveAvatarUrl } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { NavBrand } from './NavBrand';
import { UserProfileChip } from './ui/UserProfileChip';
import { NavLogoutButton } from './NavLogoutButton';
import { ThemeToggle } from './ui/ThemeToggle';
import { prefetchScreen } from '../app/screenLoaders';

interface NavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
}

export const Navbar = ({ isSidebarOpen, setIsSidebarOpen }: NavbarProps) => {
  const { t } = useTranslation('navigation');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.email || '';
  const isLoginRoute = location.pathname === '/login';

  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-50 w-full transition-all">
      <div className="h-1 w-full bg-gradient-to-r from-success to-accent" />
      <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2 sm:gap-3">

          <NavBrand
            showMenuButton
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            onLogoClick={() => navigate('/')}
            onLogoPrefetch={() => prefetchScreen('home')}
          />

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <ThemeToggle />
            {user ? (
              <>
                <UserProfileChip
                  name={displayName}
                  avatarUrl={resolveAvatarUrl(user.avatarUrl)}
                  onClick={() => navigate('/perfil')}
                  onPrefetch={() => prefetchScreen('profile')}
                />
                <NavLogoutButton onLogout={logout} />
              </>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                onMouseEnter={() => prefetchScreen('login')}
                onFocus={() => prefetchScreen('login')}
                variant="navbarAction"
                size="sm"
                disabled={isLoginRoute}
                data-testid="nav-login-button"
              >
                {!isLoginRoute && <LogIn className="w-4 h-4" />}
                {isLoginRoute ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
