import { Star } from 'lucide-react';

interface FavoriteActionButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
}

export const FavoriteActionButton = ({ isFavorite, onToggle }: FavoriteActionButtonProps) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={isFavorite}
    aria-label={isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
    className={`w-full py-3 px-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] ${
      isFavorite
        ? 'bg-primary-soft border-primary text-primary focus-visible:ring-primary'
        : 'bg-surface border-border-strong text-text hover:border-primary hover:text-primary focus-visible:ring-border-strong'
    }`}
  >
    <Star className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
    <span>{isFavorite ? 'Salvo nos Favoritos' : 'Salvar nos Favoritos'}</span>
  </button>
);
