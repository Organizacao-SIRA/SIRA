import { useState } from 'react';
import { Bookmark, BookOpen, FileText, Search } from 'lucide-react';
import { FavoriteCard } from '../components/FavoriteCard';
import type { CatalogItem } from '../types';

const TABS = [
  { id: 'all',     label: 'Todos os Materiais',  icon: Bookmark  },
  { id: 'book',    label: 'Livros',               icon: BookOpen  },
  { id: 'article', label: 'Artigos Científicos',  icon: FileText  },
] as const;

type TabId = typeof TABS[number]['id'];

interface FavoritesProps {
  favorites: CatalogItem[];
  toggleFavorite: (item: CatalogItem) => void;
  viewDetails: (item: CatalogItem) => void;
  setCurrentScreen: (screen: string) => void;
}

export const Favorites = ({ favorites, toggleFavorite, viewDetails, setCurrentScreen }: FavoritesProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('all');

  const filtered = activeTab === 'all'
    ? favorites
    : favorites.filter(f => f.type === activeTab);

  const isEmpty = favorites.length === 0;
  const isFilteredEmpty = !isEmpty && filtered.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[calc(100vh-68px)] animate-fadeIn">

      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-soft rounded-lg">
            <Bookmark className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary-dark dark:text-text">Minha Biblioteca</h1>
            {favorites.length > 0 && (
              <p className="text-text-muted text-sm mt-0.5 font-medium">
                {favorites.length} {favorites.length === 1 ? 'material salvo' : 'materiais salvos'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-strong mb-8 flex space-x-8 overflow-x-auto">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            aria-selected={activeTab === id}
            className={`pb-4 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-subtle hover:text-text-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Empty state — sem nenhum favorito */}
      {isEmpty && (
        <div className="text-center py-20 bg-surface rounded-3xl border-2 border-dashed border-border">
          <Bookmark className="h-12 w-12 text-text-subtle mx-auto mb-4" />
          <h3 className="text-xl font-bold text-primary-dark dark:text-text">Nenhum material salvo</h3>
          <p className="text-text-muted mb-8 max-w-xs mx-auto">
            Salve livros e artigos para acessá-los rapidamente aqui.
          </p>
          <button
            onClick={() => setCurrentScreen('home')}
            className="bg-primary text-white px-8 py-3 rounded-full font-bold flex items-center mx-auto hover:bg-primary-dark transition-all shadow-md cursor-pointer"
          >
            <Search className="w-4 h-4 mr-2" /> Explorar Conteúdos
          </button>
        </div>
      )}

      {/* Empty state — aba filtrada vazia */}
      {isFilteredEmpty && (
        <div className="text-center py-20 bg-surface rounded-3xl border-2 border-dashed border-border">
          {activeTab === 'book'
            ? <BookOpen className="h-12 w-12 text-text-subtle mx-auto mb-4" />
            : <FileText className="h-12 w-12 text-text-subtle mx-auto mb-4" />
          }
          <h3 className="text-xl font-bold text-primary-dark dark:text-text">
            Nenhum {activeTab === 'book' ? 'livro' : 'artigo'} salvo
          </h3>
          <p className="text-text-muted mb-8 max-w-xs mx-auto">
            Você ainda não salvou {activeTab === 'book' ? 'livros' : 'artigos'} na sua biblioteca.
          </p>
          <button
            onClick={() => setActiveTab('all')}
            className="bg-surface-muted border border-border-strong text-primary px-8 py-3 rounded-full font-bold flex items-center mx-auto hover:bg-surface-subtle transition-all cursor-pointer"
          >
            Ver todos os materiais
          </button>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filtered.map(item => (
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
