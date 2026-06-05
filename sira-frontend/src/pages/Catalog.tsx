import { useCallback } from 'react';
import { Library } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useCatalog } from '../hooks/useCatalog';
import { useFavorites } from '../queries/useFavorites';
import { CatalogSearchBar } from '../components/CatalogSearchBar';
import { CatalogCategoryFilter } from '../components/CatalogCategoryFilter';
import { SearchFilters as SearchFiltersBar } from '../components/SearchFilters';
import { CatalogGrid } from '../components/CatalogGrid';
import { PageHeader } from '../components/ui/PageHeader';
import { ViewModeToggle } from '../components/ui/ViewModeToggle';
import { useViewMode } from '../hooks/useViewMode';
import { useIsMobile } from '../hooks/useIsMobile';
import type { CatalogItem } from '../types';

export const Catalog = () => {
  const { t } = useTranslation('catalog');
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const {
    searchQuery, setSearchQuery, submitSearch, clearSearch,
    category, setCategory,
    filters, setFilters,
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

  const viewDetails = useCallback(
    (item: CatalogItem) =>
      navigate(`/material/${encodeURIComponent(item.id)}`, { state: { item, from: 'catalog' } }),
    [navigate],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fadeIn">
      <PageHeader
        icon={Library}
        title={t('header.title')}
        subtitle={t('header.subtitle')}
      />

      <div className="sira-card-strong p-3 sm:p-4 rounded-xl mb-6 flex flex-col gap-3">
        <CatalogSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={submitSearch}
          onClear={clearSearch}
        />
        <CatalogCategoryFilter categories={topics} selected={category} onSelect={setCategory} />
        <div className="border-t border-border pt-3">
          <SearchFiltersBar filters={filters} onChange={setFilters} />
        </div>
      </div>

      {!loading && (isSearchMode || total > 0) && (
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="min-w-0">
            {isSearchMode ? (
              <p className="text-sm text-text-muted">
                {t('search.resultsFor')}{' '}
                <span className="font-bold text-text">"{submittedQuery}"</span>
                {total > 0 && (
                  <span className="text-text-subtle ml-1.5">
                    ({t('search.materialCount', { count: total })})
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-text-muted">
                {t('search.available', { count: total })}
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
