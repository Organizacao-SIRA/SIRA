import { useState } from 'react';
import { FileText, BookOpen, Sparkles, Star, Brain, ChevronDown, ChevronUp } from 'lucide-react';

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
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:scale-[1.015] transition-all animate-fadeIn cursor-pointer group"
      onClick={() => viewDetails(item)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2">
          {item.type === 'article' ? (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-primary text-[10px] font-bold px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-wider">
              <FileText className="w-3 h-3" /> Artigo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-800 text-[10px] font-bold px-2.5 py-1 rounded-md border border-yellow-200 uppercase tracking-wider">
              <BookOpen className="w-3 h-3" /> Livro
            </span>
          )}
          <span className="inline-flex items-center text-gray-400 text-[10px] font-bold px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 uppercase tracking-wider">
            {item.source}
          </span>
        </div>
        <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-100 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3" /> {item.relevance}% Relevância
        </div>
      </div>

      <h3 className="text-xl font-bold text-primary-dark mb-2 leading-tight group-hover:text-primary transition-colors">
        {item.title}
      </h3>
      <p className="text-sm text-gray-500 mb-4 font-medium">{item.authors} • {item.year}</p>

      {item.aiExplanation && (
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
          <Brain className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-primary font-medium italic">{item.aiExplanation}</p>
        </div>
      )}

      <div className="mb-5">
        <p className={`text-gray-600 text-sm leading-relaxed italic ${expanded ? '' : 'line-clamp-2'}`}>
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

      <div className="flex justify-end pt-4 border-t border-gray-50">
        <button
          type="button"
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onClick={handleFavoriteClick}
          disabled={isTogglingFavorite}
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all disabled:opacity-60 ${
            isFavorite
              ? 'bg-primary border-primary text-white shadow-md hover:bg-primary-dark'
              : 'bg-white border-gray-200 text-primary hover:bg-gray-50'
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
