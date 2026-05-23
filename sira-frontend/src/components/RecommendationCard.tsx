import { useEffect, useRef, useState } from 'react';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';
import { MaterialTypeBadge } from './ui/MaterialTypeBadge';
import { FavoriteButton } from './ui/FavoriteButton';
import { trackRecommendationEvent } from '../services/api';

interface RecommendationCardProps {
  item: any;
  viewDetails: (item: any) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: boolean;
}

export const RecommendationCard = ({ item, viewDetails, toggleFavorite, isFavorite }: RecommendationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const impressionFired = useRef(false);
  const abstractIsLong = (item.abstract?.length ?? 0) > 160;

  useEffect(() => {
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
  }, [item.id]);

  const handleCardClick = () => {
    trackRecommendationEvent(item.id, 'click');
    viewDetails(item);
  };

  const handleFavoriteToggle = () => {
    if (!isFavorite) trackRecommendationEvent(item.id, 'favorite');
    toggleFavorite(item);
  };

  return (
    <div
      ref={cardRef}
      className="bg-surface p-6 rounded-2xl shadow-sm border border-border hover:shadow-md hover:scale-[1.015] transition-all animate-fadeIn cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-2 mb-3">
        <MaterialTypeBadge type={item.type} />
        <StatusBadge variant="neutral">{item.source}</StatusBadge>
      </div>

      <h3 className="text-xl font-bold text-primary-dark dark:text-text mb-2 leading-tight group-hover:text-primary transition-colors">
        {item.title}
      </h3>
      <p className="text-sm text-text-muted mb-4 font-medium">{item.authors} • {item.year}</p>

      {item.aiExplanation && (
        <div className="flex items-start gap-2 bg-info-soft border border-info-border rounded-xl px-4 py-3 mb-4">
          <Brain className="w-4 h-4 text-info-strong mt-0.5 flex-shrink-0" />
          <p className="text-sm text-info-strong font-medium italic">{item.aiExplanation}</p>
        </div>
      )}

      <div className="mb-5">
        <p className={`text-text-muted text-sm leading-relaxed italic ${expanded ? '' : 'line-clamp-2'}`}>
          {item.abstract}
        </p>
        {abstractIsLong && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
            className="mt-1.5 text-xs text-primary font-semibold hover:text-primary-dark transition-colors flex items-center gap-0.5"
          >
            {expanded
              ? <><ChevronUp className="w-3 h-3" /> Ver menos</>
              : <><ChevronDown className="w-3 h-3" /> Ver mais</>}
          </button>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <FavoriteButton isFavorite={isFavorite} onToggle={handleFavoriteToggle} />
      </div>
    </div>
  );
};
