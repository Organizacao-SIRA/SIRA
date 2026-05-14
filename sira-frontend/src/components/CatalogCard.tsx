import React from 'react';
import { BookOpen, FileText, ChevronRight } from 'lucide-react';
import { FavoriteButton } from './ui/FavoriteButton';
import { MaterialTypeBadge } from './ui/MaterialTypeBadge';
import type { CatalogItem } from '../types';

interface CatalogCardProps {
  book: CatalogItem;
  viewDetails: (item: CatalogItem) => void;
  toggleFavorite: (item: CatalogItem) => void;
  isFavorite: boolean;
}

export const CatalogCard = ({ book, viewDetails, toggleFavorite, isFavorite }: CatalogCardProps) => {
  const isArticle = book.type === 'article';

  return (
    <div
      onClick={() => viewDetails(book)}
      className="bg-surface rounded-xl border border-border-strong shadow-sm overflow-hidden flex flex-col cursor-pointer group hover:shadow-xl hover:scale-[1.04] transition-all duration-200"
    >
      {/* Cover — clean, sem overlays flutuantes */}
      <div className="h-44 overflow-hidden flex-shrink-0">
        {book.image ? (
          <div className="w-full h-full bg-surface-subtle flex items-center justify-center overflow-hidden">
            <img
              src={book.image}
              alt={book.title}
              className="h-full w-auto object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className={`w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 group-hover:scale-110 ${
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

      {/* Corpo do card — tudo em fluxo normal */}
      <div className="p-4 flex flex-col flex-1">

        {/* Linha superior: badge de tipo + botão favorito */}
        <div className="flex items-center justify-between mb-3">
          <MaterialTypeBadge type={book.type} />
          <FavoriteButton isFavorite={isFavorite} onToggle={() => toggleFavorite(book)} size="sm" />
        </div>

        <h3 className="font-bold text-primary-dark dark:text-text text-base leading-snug line-clamp-2 min-h-[48px] mb-3 group-hover:text-primary transition-colors">
          {book.title}
        </h3>

        <p className="text-sm font-semibold text-text line-clamp-1 mb-1">
          {book.authors || 'Autor desconhecido'}
        </p>

        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-muted font-medium">
            {book.year || 'S/D'} · {book.source || 'SIRA+'}
          </span>
          <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
        </div>
      </div>
    </div>
  );
};
