import { RecommendationCard } from './RecommendationCard';
import { useTranslation } from 'react-i18next';
import { CatalogCardSkeleton } from './CatalogCardSkeleton';
import { RecommendationCardSkeleton } from './RecommendationCardSkeleton';
import { Button } from './ui/Button';
import { ViewModeToggle } from './ui/ViewModeToggle';
import { useIsMobile } from '../hooks/useIsMobile';
import { useViewMode } from '../hooks/useViewMode';
import type { CatalogItem } from '../types';

interface MaterialsSectionProps {
  results: CatalogItem[];
  onRetry: () => void;
  isRegenerating?: boolean;
  viewDetails: (item: CatalogItem) => void;
  toggleFavorite: (item: CatalogItem) => void;
  isFavorite: (id: string) => boolean;
}

export const MaterialsSection = ({
  results,
  onRetry,
  isRegenerating = false,
  viewDetails,
  toggleFavorite,
  isFavorite,
}: MaterialsSectionProps) => {
  const { t } = useTranslation('recommendations');
  const isMobile = useIsMobile();
  const { mode, setMode } = useViewMode('search-results', 'horizontal');
  const variant: 'horizontal' | 'vertical' = isMobile ? 'vertical' : mode;

  const containerClasses = variant === 'vertical'
    ? 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-4 sm:gap-5'
    : 'space-y-4';
  const skeletonCount = Math.max(4, Math.min(results.length || 4, 10));

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h3 className="text-[10px] font-bold text-text-subtle uppercase tracking-[0.2em]">{t('materials.title')}</h3>
          {results.length > 0 && (
            <span className="text-[10px] font-bold text-text-muted bg-surface-subtle px-2 py-0.5 rounded-full">
              {t('materials.count', { count: results.length })}
            </span>
          )}
        </div>
        {!isMobile && results.length > 0 && !isRegenerating && (
          <ViewModeToggle mode={mode} onChange={setMode} />
        )}
      </div>

      {results.length === 0 ? (
        <div className="sira-card p-6 sm:p-8 rounded-2xl border-dashed border-border-strong text-center space-y-4">
          <p className="text-text-subtle text-sm font-medium">
            {t('materials.empty')}
          </p>
          <Button onClick={onRetry} variant="secondary" size="sm">
            {t('common:actions.retry')}
          </Button>
        </div>
      ) : isRegenerating ? (
        <div className={containerClasses} aria-busy="true" aria-label={t('materials.loadingMore')}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            variant === 'vertical'
              ? <CatalogCardSkeleton key={index} />
              : <RecommendationCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className={containerClasses}>
          {results.map((item) => (
            <RecommendationCard
              key={item.id}
              item={item}
              variant={variant}
              viewDetails={viewDetails}
              toggleFavorite={toggleFavorite}
              isFavorite={isFavorite(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
