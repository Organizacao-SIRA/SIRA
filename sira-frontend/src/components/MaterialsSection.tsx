import { RecommendationCard } from './RecommendationCard';
import { Button } from './ui/Button';
import { ViewModeToggle } from './ui/ViewModeToggle';
import { useIsMobile } from '../hooks/useIsMobile';
import { useViewMode } from '../hooks/useViewMode';

interface MaterialsSectionProps {
  results: any[];
  onRetry: () => void;
  viewDetails: (item: any) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: (id: any) => boolean;
}

export const MaterialsSection = ({ results, onRetry, viewDetails, toggleFavorite, isFavorite }: MaterialsSectionProps) => {
  const isMobile = useIsMobile();
  const { mode, setMode } = useViewMode('search-results', 'horizontal');
  const variant: 'horizontal' | 'vertical' = isMobile ? 'vertical' : mode;

  const containerClasses = variant === 'vertical'
    ? 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-4 sm:gap-5'
    : 'space-y-4';

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h3 className="text-[10px] font-bold text-text-subtle uppercase tracking-[0.2em]">Materiais Selecionados</h3>
          {results.length > 0 && (
            <span className="text-[10px] font-bold text-text-muted bg-surface-subtle px-2 py-0.5 rounded-full">
              {results.length} {results.length === 1 ? 'material' : 'materiais'}
            </span>
          )}
        </div>
        {!isMobile && results.length > 0 && (
          <ViewModeToggle mode={mode} onChange={setMode} />
        )}
      </div>

      {results.length === 0 ? (
        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-dashed border-border-strong text-center space-y-4">
          <p className="text-text-subtle text-sm font-medium">
            Não consegui encontrar materiais específicos para este pedido nas bases acadêmicas no momento.
          </p>
          <Button onClick={onRetry} variant="secondary" size="sm">
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div className={containerClasses}>
          {results.map((item: any) => (
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
