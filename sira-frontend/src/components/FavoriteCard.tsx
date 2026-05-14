import React from 'react';
import { Star, FileText, BookOpen, ChevronRight } from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';

export const FavoriteCard = ({ item, toggleFavorite, viewDetails }: any) => (
  <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex flex-col h-full hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      {item.type === 'article' ? (
        <StatusBadge variant="info" icon={<FileText className="w-3 h-3" />}>Artigo</StatusBadge>
      ) : (
        <StatusBadge variant="warning" icon={<BookOpen className="w-3 h-3" />}>Livro</StatusBadge>
      )}
      <button
        aria-label="Remover dos favoritos"
        onClick={() => toggleFavorite(item)}
        className="text-primary hover:text-danger-strong transition-colors cursor-pointer"
      >
        <Star className="w-5 h-5" fill="currentColor" />
      </button>
    </div>
    <h3 className="font-bold text-primary-dark dark:text-text text-lg mb-2 line-clamp-2 leading-tight">{item.title}</h3>
    <p className="text-sm text-text-muted mb-6 flex-grow">{item.authors} • {item.year}</p>
    <button
      onClick={() => viewDetails(item)}
      className="w-full bg-surface-muted hover:bg-surface-subtle text-primary font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-1"
    >
      Ver Detalhes <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);
