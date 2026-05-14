import { useState } from 'react';
import { Sparkles, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';
import { MaterialTypeBadge } from './ui/MaterialTypeBadge';
import { FavoriteButton } from './ui/FavoriteButton';

interface RecommendationCardProps {
  item: any;
  viewDetails: (item: any) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: boolean;
}

export const RecommendationCard = ({ item, viewDetails, toggleFavorite, isFavorite }: RecommendationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const abstractIsLong = (item.abstract?.length ?? 0) > 160;

  return (
    <div
      className="bg-surface p-6 rounded-2xl shadow-sm border border-border hover:shadow-md hover:scale-[1.015] transition-all animate-fadeIn cursor-pointer group"
      onClick={() => viewDetails(item)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2">
          <MaterialTypeBadge type={item.type} />
          <StatusBadge variant="neutral">{item.source}</StatusBadge>
        </div>
        <StatusBadge variant="success" icon={<Sparkles className="w-3 h-3" />}>
          {item.relevance}% Relevância
        </StatusBadge>
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
        <FavoriteButton isFavorite={isFavorite} onToggle={() => toggleFavorite(item)} />
      </div>
    </div>
  );
};
