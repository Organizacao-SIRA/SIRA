import React from 'react';
import { Menu, User } from 'lucide-react';

interface NavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  setCurrentScreen: (screen: string) => void;
  currentScreen: string; 
}

export const Navbar = ({ isSidebarOpen, setIsSidebarOpen, setCurrentScreen, currentScreen }: NavbarProps) => {
  
  const isAuthPage = currentScreen === 'login' || currentScreen === 'register';

  return (
    <header className="bg-[#1351B4] text-white shadow-md sticky top-0 z-50 w-full transition-all">
      <div className="h-1 w-full bg-gradient-to-r from-[#00A859] to-[#FFCD07]"></div>
      
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center">
            {/* Ícone de Menu mantido fixo sem alterar para X */}
            {!isAuthPage && (
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="mr-4 cursor-pointer p-2 hover:bg-[#003157] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                title="Menu Principal"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            
            <div 
              className="flex items-center cursor-pointer group" 
              onClick={() => setCurrentScreen('home')}
            >
              <span className="font-bold text-2xl tracking-tight">
                SIRA<span className="text-[#FFCD07]">+</span>
              </span>
              <span className="ml-3 border-l border-blue-400 pl-3 text-sm hidden md:block font-light text-blue-100 leading-tight group-hover:text-white transition-colors">
                Sistema Inteligente de<br/>Recomendação Acadêmica
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCurrentScreen('login')}
              className={`flex items-center cursor-pointer px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm border ${
                currentScreen === 'login' 
                ? 'bg-white text-[#1351B4] border-white' 
                : 'bg-[#003157] hover:bg-[#002244] text-white border-blue-800'
              }`}
            >
              <User className={`w-4 h-4 mr-2 ${currentScreen === 'login' ? 'text-[#1351B4]' : 'text-gray-300'}`} />
              {currentScreen === 'login' ? 'Acessando...' : 'Entrar'}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
