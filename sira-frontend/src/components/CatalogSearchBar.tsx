import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';

interface CatalogSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export const CatalogSearchBar = ({ value, onChange, onSubmit, onClear }: CatalogSearchBarProps) => {
  const { t } = useTranslation('catalog');

  return (
    <form
      onSubmit={e => { e.preventDefault(); onSubmit(); }}
      className="flex gap-2 w-full"
    >
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={t('search.placeholder')}
          aria-label={t('search.label')}
          className="w-full pl-4 pr-9 py-2.5 bg-surface-muted text-text border border-border-strong rounded-lg outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-colors text-sm"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text transition-colors duration-150 cursor-pointer rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus/50"
            aria-label={t('search.clear')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <Button type="submit" size="sm" className="flex-shrink-0">
        <Search className="w-4 h-4" />
        {t('search.submit')}
      </Button>
    </form>
  );
};
