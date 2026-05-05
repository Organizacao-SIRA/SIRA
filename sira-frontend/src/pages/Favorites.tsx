import React, { useState } from 'react';
import { Bookmark, Search } from 'lucide-react';
import { FavoriteCard } from '../components/FavoriteCard';

// Adicionamos a tipagem das Props para o arquivo não ficar vermelho
interface FavoritesProps {
  favorites: any[];
  toggleFavorite: (item: any) => void;
  viewDetails: (item: any) => void;
  setCurrentScreen: (screen: string) => void;
}

export const Favorites = ({ favorites, toggleFavorite, viewDetails, setCurrentScreen }: FavoritesProps) => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredFavorites = favorites.filter(fav => {
    if (activeTab === 'all') return true;
    return fav.type === activeTab;
  });

  return (
    // Mudamos para max-w-full para ocupar o mesmo espaço do catálogo ao fechar o menu
    <div className="w-full mx-auto px-4 py-8 min-h-[calc(100vh-68px)] animate-fadeIn">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Bookmark className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-primary-dark">Minha Biblioteca</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8 flex space-x-8 overflow-x-auto">
        {['all', 'book', 'article'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab === 'all' ? 'Todos os Materiais' : tab === 'book' ? 'Livros' : 'Artigos Científicos'}
          </button>
        ))}
      </div>

      {/* Grid de Favoritos */}
      {filteredFavorites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <Bookmark className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-primary-dark">Nenhum item salvo</h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">Salve livros e artigos para acessá-los rapidamente aqui.</p>
          <button 
            onClick={() => setCurrentScreen('home')}
            className="bg-primary text-white px-8 py-3 rounded-full font-bold flex items-center mx-auto hover:bg-primary-dark transition-all shadow-md"
          >
            <Search className="w-4 h-4 mr-2" /> Explorar Conteúdos
          </button>
        </div>
      ) : (
        // Grid responsiva que expande com o menu fechado
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredFavorites.map(item => (
            <FavoriteCard 
              key={item.id} 
              item={item} 
              toggleFavorite={toggleFavorite} 
              viewDetails={viewDetails} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
