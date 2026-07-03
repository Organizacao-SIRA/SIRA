import React from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md';
}

export const FavoriteButton = ({ isFavorite, onToggle, size = 'md' }: FavoriteButtonProps) => {
  const { t } = useTranslation('common');
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <span
      onClick={stop}
      onPointerDown={stop}
      onMouseDown={stop}
      onTouchStart={stop}
      onKeyDown={stop}
      className="inline-flex flex-shrink-0"
    >
      <button
        type="button"
        aria-label={isFavorite ? t('favorites.remove') : t('favorites.add')}
        aria-pressed={isFavorite}
        data-testid="favorite-toggle"
        onClick={e => { e.stopPropagation(); onToggle(e); }}
        className={`p-2.5 rounded-full border transition-colors duration-150 cursor-pointer flex-shrink-0 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface ${
          isFavorite
            ? 'bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark'
            : 'bg-surface-muted border-border-strong text-text-subtle hover:border-link hover:text-link hover:bg-primary-soft'
        }`}
      >
        <Star
          className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}
          fill={isFavorite ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
      </button>
    </span>
  );
};
