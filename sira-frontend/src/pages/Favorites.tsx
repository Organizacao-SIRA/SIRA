import { useState } from 'react';
import { Bookmark, BookOpen, FileText, Search } from 'lucide-react';
import { FavoriteCard } from '../components/FavoriteCard';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
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

  const bookCount    = favorites.filter(f => f.type === 'book').length;
  const articleCount = favorites.filter(f => f.type === 'article').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[calc(100vh-68px)] animate-fadeIn">

      <PageHeader
        icon={Bookmark}
        title="Minha Biblioteca"
        subtitle="Acesse rapidamente os livros e artigos que você salvou."
      />

      {/* Tabs + contador */}
      <div className="border-b border-border-strong mb-8 flex items-end justify-between overflow-x-auto">
        <div className="flex space-x-8">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            aria-selected={activeTab === id}
            role="tab"
            className={`pb-4 px-1 border-b-2 font-bold text-sm transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm ${
              activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-subtle hover:text-text-muted'
            }`}
          >
            {label}
          </button>
        ))}
        </div>
        {favorites.length > 0 && (
          <div className="pb-4 flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-3 py-1 rounded-full shadow-sm">
              <Bookmark className="w-3.5 h-3.5" />
              {favorites.length} {favorites.length === 1 ? 'salvo' : 'salvos'}
            </span>
            <span className="text-xs text-text-muted font-medium whitespace-nowrap">
              {bookCount > 0 && <>{bookCount} {bookCount === 1 ? 'livro' : 'livros'}</>}
              {bookCount > 0 && articleCount > 0 && <span className="mx-1 opacity-40">·</span>}
              {articleCount > 0 && <>{articleCount} {articleCount === 1 ? 'artigo' : 'artigos'}</>}
            </span>
          </div>
        )}
      </div>

      {/* Empty state — sem nenhum favorito */}
      {isEmpty && (
        <div className="text-center py-20 bg-surface rounded-3xl border-2 border-dashed border-border">
          <Bookmark className="h-12 w-12 text-text-subtle mx-auto mb-4" />
          <h3 className="text-xl font-bold text-primary-dark dark:text-text">Nenhum material salvo</h3>
          <p className="text-text-muted mb-8 max-w-xs mx-auto">
            Salve livros e artigos para acessá-los rapidamente aqui.
          </p>
          <Button variant="primary" size="lg" onClick={() => setCurrentScreen('home')} className="mx-auto">
            <Search className="w-4 h-4" /> Explorar Conteúdos
          </Button>
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
          <Button variant="secondary" size="lg" onClick={() => setActiveTab('all')} className="mx-auto">
            Ver todos os materiais
          </Button>
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
