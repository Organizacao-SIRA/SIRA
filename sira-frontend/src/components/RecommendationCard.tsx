import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';
import { MaterialTypeBadge } from './ui/MaterialTypeBadge';
import { FavoriteButton } from './ui/FavoriteButton';
import { MaterialPlaceholder } from './ui/MaterialPlaceholder';
import { trackRecommendationEvent } from '../services/api';

type Variant = 'horizontal' | 'vertical';

interface RecommendationCardProps {
  item: any;
  viewDetails: (item: any) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: boolean;
  variant?: Variant;
  trackEvents?: boolean;
  stretch?: boolean;
}

export const RecommendationCard = ({
  item,
  viewDetails,
  toggleFavorite,
  isFavorite,
  variant = 'horizontal',
  trackEvents = true,
  stretch = true,
}: RecommendationCardProps) => {
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const impressionFired = useRef(false);
  const showImage = Boolean(item.image) && !imageError;
  const isVertical = variant === 'vertical';

  useEffect(() => {
    if (!trackEvents) return;
    const el = cardRef.current;
    if (!el || impressionFired.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !impressionFired.current) {
          impressionFired.current = true;
          trackRecommendationEvent(item.id, 'impression');
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [item.id, trackEvents]);

  const handleCardClick = () => {
    if (trackEvents) trackRecommendationEvent(item.id, 'click');
    viewDetails(item);
  };

  const handleFavoriteToggle = () => {
    if (trackEvents && !isFavorite) trackRecommendationEvent(item.id, 'favorite');
    toggleFavorite(item);
  };

  const cover = showImage ? (
    <img
      src={item.image}
      alt={`Capa de ${item.title}`}
      loading="lazy"
      onError={() => setImageError(true)}
      className={
        isVertical
          ? 'w-full h-full object-contain bg-surface-subtle'
          : 'w-full h-auto rounded-lg shadow-sm border border-border bg-surface-subtle'
      }
    />
  ) : (
    <MaterialPlaceholder
      type={item.type}
      className={
        isVertical
          ? 'w-full h-full rounded-none border-0'
          : 'w-full aspect-[2/3] shadow-sm'
      }
      iconClassName={isVertical ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-7 h-7 sm:w-9 sm:h-9'}
    />
  );

  const content = (
    <div className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap min-w-0">
          <MaterialTypeBadge type={item.type} />
          {item.provider && (
            <span className="hidden sm:inline-flex">
              <StatusBadge variant="neutral">{item.provider}</StatusBadge>
            </span>
          )}
        </div>
        <FavoriteButton isFavorite={isFavorite} onToggle={handleFavoriteToggle} size="sm" />
      </div>

      <h3 className="text-[15px] sm:text-lg font-bold text-primary-dark dark:text-text leading-snug line-clamp-2 break-words">
        {item.title}
      </h3>

      {item.aiExplanation && (
        <div className="flex items-start gap-1.5 bg-accent-light/60 dark:bg-accent/10 rounded-lg px-2 py-1.5 sm:px-2.5 sm:py-2 border-l-2 border-accent min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-accent-dark dark:text-accent shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs sm:text-sm text-text leading-snug line-clamp-3 break-words min-w-0">
            {item.aiExplanation}
          </p>
        </div>
      )}

      {item.abstract && (
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-2 italic break-words">
          {item.abstract}
        </p>
      )}

      <div className="flex items-baseline gap-1.5 mt-auto pt-1 text-xs text-text-subtle min-w-0">
        <span className="font-medium text-text-muted truncate min-w-0">{item.authors}</span>
        <span aria-hidden="true" className="shrink-0">·</span>
        <span className="shrink-0">{item.year}</span>
      </div>
    </div>
  );

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes de ${item.title}`}
      onClick={handleCardClick}
      onKeyDown={e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        handleCardClick();
      }}
      className={`bg-surface rounded-2xl border border-border hover:border-primary/40 hover:shadow-md hover:scale-[1.015] active:scale-[0.99] transition-all duration-200 animate-fadeIn cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden min-w-0 ${
        isVertical ? `flex flex-col ${stretch ? 'h-full' : ''}` : 'p-3.5 sm:p-5'
      }`}
    >
      {isVertical ? (
        <>
          <div className="h-40 sm:h-44 overflow-hidden border-b border-border bg-surface-subtle flex items-center justify-center">
            {cover}
          </div>
          <div className="p-3.5 sm:p-4 flex-1 flex flex-col min-w-0">{content}</div>
        </>
      ) : (
        <div className="flex gap-3 sm:gap-4 min-w-0">
          <div className="shrink-0 self-start w-16 sm:w-24">{cover}</div>
          {content}
        </div>
      )}
    </div>
  );
};
