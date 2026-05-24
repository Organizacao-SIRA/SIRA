import { Library } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { CatalogSearchBar } from '../components/CatalogSearchBar';
import { CatalogCategoryFilter } from '../components/CatalogCategoryFilter';
import { CatalogGrid } from '../components/CatalogGrid';
import { PageHeader } from '../components/ui/PageHeader';
import { ViewModeToggle } from '../components/ui/ViewModeToggle';
import { useViewMode } from '../hooks/useViewMode';
import { useIsMobile } from '../hooks/useIsMobile';
import type { CatalogItem } from '../types';

interface CatalogProps {
  viewDetails: (item: CatalogItem) => void;
  toggleFavorite: (item: CatalogItem) => void;
  isFavorite: (id: string) => boolean;
}

export const Catalog = ({ viewDetails, toggleFavorite, isFavorite }: CatalogProps) => {
  const {
    searchQuery, setSearchQuery, submitSearch, clearSearch,
    category, setCategory,
    page, setPage,
    items, loading, error,
    total, totalPages,
    isSearchMode, submittedQuery,
    topics,
    refetch,
  } = useCatalog();

  const { mode: viewMode, setMode: setViewMode } = useViewMode('catalog', 'vertical');
  const isMobile = useIsMobile();
  const effectiveMode = isMobile ? 'vertical' : viewMode;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fadeIn">
      <PageHeader
        icon={Library}
        title="Catálogo Acadêmico"
        subtitle="Navegue pelo nosso acervo integrado de livros acadêmicos e artigos científicos."
      />

      <div className="bg-surface p-3 sm:p-4 rounded-xl border border-border-strong shadow-sm mb-6 flex flex-col gap-3">
        <CatalogSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={submitSearch}
          onClear={clearSearch}
        />
        <CatalogCategoryFilter categories={topics} selected={category} onSelect={setCategory} />
      </div>

      {!loading && (isSearchMode || total > 0) && (
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="min-w-0">
            {isSearchMode ? (
              <p className="text-sm text-text-muted">
                Resultados para{' '}
                <span className="font-bold text-text">"{submittedQuery}"</span>
                {total > 0 && (
                  <span className="text-text-subtle ml-1.5">
                    ({total} {total === 1 ? 'material' : 'materiais'})
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-text-muted">
                <span className="font-semibold text-text">{total}</span>{' '}
                {total === 1 ? 'material disponível' : 'materiais disponíveis'}
              </p>
            )}
          </div>
          {!isMobile && total > 0 && (
            <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          )}
        </div>
      )}

      <CatalogGrid
        items={items}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        total={total}
        isSearchMode={isSearchMode}
        searchQuery={searchQuery}
        onPageChange={setPage}
        onRetry={refetch}
        viewDetails={viewDetails}
        toggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
        viewMode={effectiveMode}
      />
    </div>
  );
};
