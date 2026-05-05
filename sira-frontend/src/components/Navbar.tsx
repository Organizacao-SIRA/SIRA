import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import type { AuthUser } from '../types';
import { Button } from './ui/Button';

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

  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-50 w-full transition-all">
      <div className="h-1 w-full bg-gradient-to-r from-success to-accent"></div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <div className="flex items-center">
            {!isAuthPage && (
              <button
                aria-label="Abrir Menu Principal"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="mr-4 cursor-pointer p-2 hover:bg-primary-dark rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                title="Menu Principal"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}

            <button aria-label="Ir para a página inicial" className="flex items-center cursor-pointer group bg-transparent border-none p-0 focus:outline-none" onClick={() => setCurrentScreen('home')}>
              <span className="font-bold text-2xl tracking-tight">
                SIRA<span className="text-accent">+</span>
              </span>
              <span className="ml-3 border-l border-blue-400 pl-3 text-sm hidden md:block font-light text-blue-100 leading-tight group-hover:text-white transition-colors text-left">
                Sistema Inteligente de<br />Recomendação Acadêmica
              </span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Button
                  onClick={() => setCurrentScreen('profile')}
                  variant="primary"
                  size="sm"
                  className="hidden sm:flex bg-primary-dark hover:bg-primary-darker border-blue-800"
                >
                  <User className="w-4 h-4 text-gray-300 mr-2" />
                  <span className="max-w-[120px] truncate">{user.name || user.email}</span>
                </Button>
                <Button
                  onClick={onLogout}
                  variant="danger"
                  size="sm"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setCurrentScreen('login')}
                variant={currentScreen === 'login' ? 'secondary' : 'primary'}
                size="sm"
                className={currentScreen === 'login' ? '' : 'bg-primary-dark hover:bg-primary-darker border-blue-800'}
              >
                <User className={`w-4 h-4 mr-2 ${currentScreen === 'login' ? 'text-primary' : 'text-gray-300'}`} />
                {currentScreen === 'login' ? 'Acessando...' : 'Entrar'}
              </Button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
