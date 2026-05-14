import React from 'react';
import type { AuthUser } from '../types';
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
  user: AuthUser | null;
  onLogout: () => void;
}

export const Navbar = ({ isSidebarOpen, setIsSidebarOpen, setCurrentScreen, currentScreen, user, onLogout }: NavbarProps) => {
  const isAuthPage = currentScreen === 'login' || currentScreen === 'register';
  const displayName = user?.name || user?.email || '';

  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-50 w-full transition-all">
      <div className="h-1 w-full bg-gradient-to-r from-success to-accent" />
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <NavBrand
            showMenuButton={!isAuthPage}
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            onLogoClick={() => setCurrentScreen('home')}
          />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <UserProfileChip
                  name={displayName}
                  onClick={() => setCurrentScreen('profile')}
                />
                <NavLogoutButton onLogout={onLogout} />
              </>
            ) : (
              <Button
                onClick={() => setCurrentScreen('login')}
                variant={currentScreen === 'login' ? 'secondary' : 'primary'}
                size="sm"
                className={currentScreen === 'login' ? '' : 'bg-primary-dark hover:bg-primary-darker border-blue-800'}
              >
                <div className="w-4 h-4 mr-2 rounded-full flex items-center justify-center bg-white/20">
                  <span className="text-[10px] font-black">?</span>
                </div>
                {currentScreen === 'login' ? 'Acessando...' : 'Entrar'}
              </Button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
