import { useState } from 'react';
import { FileText, BookOpen, Sparkles, Star, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';

interface RecommendationCardProps {
  item: any;
  viewDetails: (item: any) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: boolean;
}

export const RecommendationCard = ({ item, viewDetails, toggleFavorite, isFavorite }: RecommendationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const abstractIsLong = (item.abstract?.length ?? 0) > 160;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsTogglingFavorite(true);
    try {
      await (toggleFavorite(item) as unknown as Promise<void>);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <div
      className="bg-surface p-6 rounded-2xl shadow-sm border border-border hover:shadow-md hover:scale-[1.015] transition-all animate-fadeIn cursor-pointer group"
      onClick={() => viewDetails(item)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2">
          {item.type === 'article' ? (
            <StatusBadge variant="info" icon={<FileText className="w-3 h-3" />}>Artigo</StatusBadge>
          ) : (
            <StatusBadge variant="warning" icon={<BookOpen className="w-3 h-3" />}>Livro</StatusBadge>
          )}
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
        <button
          type="button"
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onClick={handleFavoriteClick}
          disabled={isTogglingFavorite}
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all disabled:opacity-60 ${
            isFavorite
              ? 'bg-primary border-primary text-white shadow-md hover:bg-primary-dark'
              : 'bg-surface border-border-strong text-primary hover:bg-surface-muted'
          }`}
        >
          {isTogglingFavorite
            ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <Star className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
          }
        </button>
      </div>
    </div>
  );
};
