import { useCallback, useEffect, useState } from 'react';
import { Bookmark, BookOpen, FileText, Search } from 'lucide-react';
import { CatalogCardSkeleton } from '../components/CatalogCardSkeleton';
import { RecommendationCardSkeleton } from '../components/RecommendationCardSkeleton';
import { RecommendationCard } from '../components/RecommendationCard';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { ViewModeToggle } from '../components/ui/ViewModeToggle';
import { useIsMobile } from '../hooks/useIsMobile';
import { useViewMode } from '../hooks/useViewMode';
import { fetchFavorites } from '../services/api';
import type { CatalogItem } from '../types';

const TABS = [
  { id: 'all',     label: 'Todos os Materiais',  icon: Bookmark  },
  { id: 'book',    label: 'Livros',               icon: BookOpen  },
  { id: 'article', label: 'Artigos Científicos',  icon: FileText  },
] as const;

type TabId = typeof TABS[number]['id'];
type FavoriteCounts = Record<TabId, number>;

const FAVORITES_PAGE_SIZE = 20;
const EMPTY_COUNTS: FavoriteCounts = { all: 0, book: 0, article: 0 };

interface FavoritesProps {
  toggleFavorite: (item: CatalogItem) => Promise<boolean> | boolean | void;
  viewDetails: (item: CatalogItem) => void;
  setCurrentScreen: (screen: string) => void;
}

export const Favorites = ({ toggleFavorite, viewDetails, setCurrentScreen }: FavoritesProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [counts, setCounts] = useState<FavoriteCounts>(EMPTY_COUNTS);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { mode: viewMode, setMode: setViewMode } = useViewMode('vertical');

  const effectiveVariant = isMobile ? 'vertical' : viewMode;
  const containerClasses = effectiveVariant === 'vertical'
    ? 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),20rem))] justify-center items-start gap-4 sm:gap-6'
    : 'space-y-4';

  const isEmpty = !isInitialLoading && counts.all === 0;
  const isFilteredEmpty = !isInitialLoading && counts.all > 0 && total === 0;
  const hasMore = page + 1 < totalPages;

  const bookCount = counts.book;
  const articleCount = counts.article;

  const loadFavoritesPage = useCallback(async (
    tab: TabId,
    nextPage: number,
    append = false,
    signal?: AbortSignal,
  ) => {
    if (append) setIsLoadingMore(true);
    else {
      setIsInitialLoading(true);
      setItems([]);
      setPage(0);
      setTotal(0);
      setTotalPages(0);
    }
    setError(null);

    try {
      const data = await fetchFavorites({
        page: nextPage,
        limit: FAVORITES_PAGE_SIZE,
        type: tab,
        signal,
      });
      setItems(prev => append ? [...prev, ...data.items] : data.items);
      setCounts(data.counts);
      setPage(data.page);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      if (signal?.aborted) return;
      setError(err?.message || 'Erro ao carregar favoritos');
    } finally {
      if (!signal?.aborted) {
        setIsInitialLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadFavoritesPage(activeTab, 0, false, controller.signal);
    return () => controller.abort();
  }, [activeTab, loadFavoritesPage]);

  const handleFavoriteToggle = async (item: CatalogItem) => {
    const result = await toggleFavorite(item);
    if (result === false) return;

    setItems(prev => prev.filter(f => f.id !== item.id));
    setTotal(prev => Math.max(0, prev - 1));
    setCounts(prev => ({
      ...prev,
      all: Math.max(0, prev.all - 1),
      ...(item.type === 'book' || item.type === 'article'
        ? { [item.type]: Math.max(0, prev[item.type] - 1) }
        : {}),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-[calc(100vh-68px)] animate-fadeIn">

      <PageHeader
        icon={Bookmark}
        title="Minha Biblioteca"
        subtitle="Acesse rapidamente os livros e artigos que você salvou."
      />

      {/* Tabs + contador — empilha em mobile */}
      <div className="border-b border-border-strong mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div
          role="tablist"
          aria-label="Filtro da biblioteca"
          className="flex space-x-6 sm:space-x-8 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            aria-selected={activeTab === id}
            role="tab"
            className={`pb-3 sm:pb-4 px-1 border-b-2 font-bold text-sm transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm ${
              activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-subtle hover:text-text-muted'
            }`}
          >
            {label}
          </button>
        ))}
        </div>
        {counts.all > 0 && (
          <div className="pb-3 sm:pb-4 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-3 py-1 rounded-full shadow-sm">
                <Bookmark className="w-3.5 h-3.5" />
                {counts.all} {counts.all === 1 ? 'salvo' : 'salvos'}
              </span>
              <span className="text-xs text-text-muted font-medium whitespace-nowrap">
                {bookCount > 0 && <>{bookCount} {bookCount === 1 ? 'livro' : 'livros'}</>}
                {bookCount > 0 && articleCount > 0 && <span className="mx-1 opacity-40">·</span>}
                {articleCount > 0 && <>{articleCount} {articleCount === 1 ? 'artigo' : 'artigos'}</>}
              </span>
            </div>
            {!isMobile && (items.length > 0 || isInitialLoading) && (
              <ViewModeToggle mode={viewMode} onChange={setViewMode} />
            )}
          </div>
        )}
      </div>

      {/* Empty state — sem nenhum favorito */}
      {isEmpty && (
        <div className="text-center py-12 sm:py-20 px-4 bg-surface rounded-3xl border-2 border-dashed border-border">
          <Bookmark className="h-12 w-12 text-text-subtle mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-primary-dark dark:text-text">Nenhum material salvo</h3>
          <p className="text-text-muted mb-6 sm:mb-8 max-w-xs mx-auto text-sm sm:text-base">
            Salve livros e artigos para acessá-los rapidamente aqui.
          </p>
          <Button variant="primary" size="lg" onClick={() => setCurrentScreen('home')} className="mx-auto">
            <Search className="w-4 h-4" /> Explorar Conteúdos
          </Button>
        </div>
      )}

      {/* Empty state — aba filtrada vazia */}
      {isFilteredEmpty && (
        <div className="text-center py-12 sm:py-20 px-4 bg-surface rounded-3xl border-2 border-dashed border-border">
          {activeTab === 'book'
            ? <BookOpen className="h-12 w-12 text-text-subtle mx-auto mb-4" />
            : <FileText className="h-12 w-12 text-text-subtle mx-auto mb-4" />
          }
          <h3 className="text-lg sm:text-xl font-bold text-primary-dark dark:text-text">
            Nenhum {activeTab === 'book' ? 'livro' : 'artigo'} salvo
          </h3>
          <p className="text-text-muted mb-6 sm:mb-8 max-w-xs mx-auto text-sm sm:text-base">
            Você ainda não salvou {activeTab === 'book' ? 'livros' : 'artigos'} na sua biblioteca.
          </p>
          <Button variant="secondary" size="lg" onClick={() => setActiveTab('all')} className="mx-auto">
            Ver todos os materiais
          </Button>
        </div>
      )}

      {isInitialLoading && (
        effectiveVariant === 'vertical' ? (
          <div className={containerClasses}>
            {Array.from({ length: FAVORITES_PAGE_SIZE }).map((_, index) => (
              <CatalogCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: FAVORITES_PAGE_SIZE }).map((_, index) => (
              <RecommendationCardSkeleton key={index} />
            ))}
          </div>
        )
      )}

      {error && !isInitialLoading && (
        <div className="bg-surface border border-danger-border rounded-2xl p-8 text-center space-y-4">
          <p className="text-sm text-danger-strong font-medium">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => loadFavoritesPage(activeTab, 0)}>
            Tentar novamente
          </Button>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className={containerClasses}>
            {items.map(item => (
              <RecommendationCard
                key={item.id}
                item={item}
                variant={effectiveVariant}
                stretch={false}
                trackEvents={false}
                viewDetails={viewDetails}
                toggleFavorite={handleFavoriteToggle}
                isFavorite={true}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6 sm:mt-8">
              <Button
                variant="secondary"
                size="sm"
                isLoading={isLoadingMore}
                onClick={() => loadFavoritesPage(activeTab, page + 1, true)}
              >
                Carregar mais
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
