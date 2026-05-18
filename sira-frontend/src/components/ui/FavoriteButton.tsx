import React from 'react';
import { Star } from 'lucide-react';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md';
}

export const FavoriteButton = ({ isFavorite, onToggle, size = 'md' }: FavoriteButtonProps) => (
  <button
    type="button"
    aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    onClick={e => { e.stopPropagation(); onToggle(e); }}
    className={`p-2 rounded-full border transition-all duration-150 cursor-pointer flex-shrink-0 active:scale-[0.98] ${
      isFavorite
        ? 'bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark'
        : 'bg-surface-muted border-border-strong text-text-subtle hover:border-primary hover:text-primary hover:bg-primary-soft'
    }`}
  >
    <Star
      className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}
      fill={isFavorite ? 'currentColor' : 'none'}
    />
  </button>
);
