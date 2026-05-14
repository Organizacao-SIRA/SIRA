import { BookOpen, FileText, ChevronRight } from 'lucide-react';
import { MaterialTypeBadge } from './ui/MaterialTypeBadge';
import { FavoriteButton } from './ui/FavoriteButton';
import type { CatalogItem } from '../types';

interface FavoriteCardProps {
  item: CatalogItem;
  toggleFavorite: (item: CatalogItem) => void;
  viewDetails: (item: CatalogItem) => void;
}

export const FavoriteCard = ({ item, toggleFavorite, viewDetails }: FavoriteCardProps) => {
  const isArticle = item.type === 'article';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes de ${item.title}`}
      onClick={() => viewDetails(item)}
      onKeyDown={e => e.key === 'Enter' && viewDetails(item)}
      className="bg-surface rounded-xl border border-border-strong shadow-sm overflow-hidden flex flex-col cursor-pointer group hover:shadow-xl hover:scale-[1.04] transition-all duration-200"
    >
      {/* Capa */}
      <div className="h-44 overflow-hidden flex-shrink-0">
        {item.image ? (
          <div className="w-full h-full bg-surface-subtle flex items-center justify-center overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-auto object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className={`w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
            isArticle
              ? 'bg-gradient-to-br from-primary-dark to-[#0a4a86]'
              : 'bg-gradient-to-br from-primary to-[#1e67e3]'
          }`}>
            {isArticle
              ? <FileText className="w-16 h-16 text-white/20" />
              : <BookOpen className="w-16 h-16 text-white/20" />
            }
          </div>
        )}
      </div>

      {/* Corpo */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <MaterialTypeBadge type={item.type} />
          <FavoriteButton isFavorite={true} onToggle={() => toggleFavorite(item)} size="sm" />
        </div>

        <h3 className="font-bold text-primary-dark dark:text-text text-base leading-snug line-clamp-2 min-h-[48px] mb-3 group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        <p className="text-sm font-semibold text-text line-clamp-1 mb-1">
          {item.authors || 'Autor desconhecido'}
        </p>

        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-muted font-medium">
            {item.year || 'S/D'} · {item.source || 'SIRA+'}
          </span>
          <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
        </div>
      </div>
    </div>
  );
};
