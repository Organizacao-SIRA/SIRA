import React from 'react';
import { Search } from 'lucide-react';
import { AiRecommendations } from './AiRecommendations';
import type { AuthUser } from '../types';

interface HomeProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  user: AuthUser | null;
  viewDetails: (item: any) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: (id: string) => boolean;
  setCurrentScreen: (screen: string) => void;
}

export const Home = ({ searchQuery, setSearchQuery, handleSearch, user, viewDetails, toggleFavorite, isFavorite, setCurrentScreen }: HomeProps) => (
  <div className="flex-1 flex flex-col bg-gray-50 min-h-[calc(100vh-68px)] animate-fadeIn">
    <div className="max-w-4xl w-full mx-auto px-4 pt-10 pb-6 text-center space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#003157] tracking-tight">
          O que você está investigando hoje?
        </h1>
        <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
          Nossa IA encontra os livros e artigos científicos mais relevantes para o seu contexto acadêmico.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <div className="relative flex items-center shadow-lg rounded-full bg-white border border-gray-200 focus-within:border-[#1351B4] transition-all">
          <Search className="absolute left-5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ex: IA na gestão pública..."
            className="w-full py-4 pl-14 pr-32 rounded-full text-base text-gray-800 outline-none placeholder-gray-400"
            required
          />
          <button
            type="submit"
            className="absolute right-1.5 bg-[#1351B4] hover:bg-[#003157] text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm"
          >
            Pesquisar
          </button>
        </div>
      </form>
    </div>

    <div className="flex-1">
      <AiRecommendations
        user={user}
        viewDetails={viewDetails}
        toggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
        setCurrentScreen={setCurrentScreen}
      />
    </div>
  </div>
);
