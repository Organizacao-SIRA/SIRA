import React from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { CatalogSearchBar } from '../components/CatalogSearchBar';
import { CatalogCategoryFilter } from '../components/CatalogCategoryFilter';
import { CatalogGrid } from '../components/CatalogGrid';
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-dark dark:text-text">Catálogo Acadêmico</h1>
        <p className="text-text-muted mt-1 font-medium">
          Navegue pelo nosso acervo integrado de livros acadêmicos e artigos científicos.
        </p>
      </div>

      <div className="bg-surface p-4 rounded-xl border border-border-strong shadow-sm mb-6 flex flex-col gap-3">
        <CatalogSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={submitSearch}
          onClear={clearSearch}
        />
        <CatalogCategoryFilter categories={topics} selected={category} onSelect={setCategory} />
      </div>

      {isSearchMode && !loading && (
        <p className="text-sm text-text-muted mb-4">
          Resultados para{' '}
          <span className="font-bold text-text">"{submittedQuery}"</span>
        </p>
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
      />
    </div>
  );
};
