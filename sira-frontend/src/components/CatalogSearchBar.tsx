import React from 'react';
import { Search, X } from 'lucide-react';

interface CatalogSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export const CatalogSearchBar = ({ value, onChange, onSubmit, onClear }: CatalogSearchBarProps) => (
  <form
    onSubmit={e => { e.preventDefault(); onSubmit(); }}
    className="flex gap-2 w-full"
  >
    <div className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Pesquisar por título ou autor..."
        className="w-full pl-4 pr-9 py-2.5 bg-surface-muted text-text border border-border-strong rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text transition-colors cursor-pointer"
          aria-label="Limpar pesquisa"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>

    <button
      type="submit"
      className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors cursor-pointer flex-shrink-0"
    >
      <Search className="w-4 h-4" />
      Buscar
    </button>
  </form>
);
