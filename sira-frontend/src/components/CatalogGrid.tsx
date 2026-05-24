import React from 'react';
import { BookOpen } from 'lucide-react';
import { RecommendationCard } from './RecommendationCard';
import { CatalogCardSkeleton } from './CatalogCardSkeleton';
import { RecommendationCardSkeleton } from './RecommendationCardSkeleton';
import { CatalogPagination } from './CatalogPagination';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';
import type { CatalogItem } from '../types';
import type { ViewMode } from '../hooks/useViewMode';

interface CatalogGridProps {
  items: CatalogItem[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  isSearchMode: boolean;
  searchQuery: string;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  viewDetails: (item: CatalogItem) => void;
  toggleFavorite: (item: CatalogItem) => void;
  isFavorite: (id: string) => boolean;
  viewMode?: ViewMode;
}

const SKELETON_COUNT = 4;

export const CatalogGrid = ({
  items, loading, error, page, totalPages, total,
  isSearchMode, searchQuery, onPageChange, onRetry,
  viewDetails, toggleFavorite, isFavorite,
  viewMode = 'vertical',
}: CatalogGridProps) => {
  if (loading) {
    return viewMode === 'horizontal' ? (
      <div className="space-y-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <RecommendationCardSkeleton key={i} />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <CatalogCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar o catálogo"
        message={error}
        onRetry={onRetry}
        className="max-w-2xl mx-auto"
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="w-full h-full" />}
        title="Nenhum material encontrado"
        description={
          isSearchMode
            ? `Nenhum resultado para "${searchQuery}". Tente outros termos de busca.`
            : 'Nenhum material disponível para esta categoria no momento.'
        }
        actionLabel={isSearchMode ? undefined : 'Tentar novamente'}
        onAction={isSearchMode ? undefined : onRetry}
      />
    );
  }

  const containerClasses = viewMode === 'horizontal'
    ? 'space-y-4'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';

  return (
    <>
      <div className={containerClasses}>
        {items.map(item => (
          <RecommendationCard
            key={item.id}
            item={item}
            variant={viewMode}
            trackEvents={false}
            viewDetails={viewDetails}
            toggleFavorite={toggleFavorite}
            isFavorite={isFavorite(item.id)}
          />
        ))}
      </div>
      <CatalogPagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={onPageChange}
      />
    </>
  );
};
