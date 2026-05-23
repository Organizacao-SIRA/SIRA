import { Filter, X, BookOpen, FileText, Unlock } from 'lucide-react';
import type { SearchFilters as SearchFiltersState } from '../types';

const AREAS = [
  { value: 'ia', label: 'Inteligência Artificial' },
  { value: 'cd', label: 'Ciência de Dados' },
  { value: 'edu', label: 'Educação' },
  { value: 'sau', label: 'Saúde & Medicina' },
  { value: 'dir', label: 'Direito' },
  { value: 'eco', label: 'Economia' },
  { value: 'soc', label: 'Sociologia' },
  { value: 'amb', label: 'Meio Ambiente' },
  { value: 'gp', label: 'Gestão Pública' },
];

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onChange: (filters: SearchFiltersState) => void;
}

type TypeOption = { value: 'book' | 'article' | null; label: string; icon: React.ReactNode };

const TYPE_OPTIONS: TypeOption[] = [
  { value: null, label: 'Todos', icon: null },
  { value: 'book', label: 'Livros', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { value: 'article', label: 'Artigos', icon: <FileText className="w-3.5 h-3.5" /> },
];

function getPeriodOptions() {
  const y = new Date().getFullYear();
  return [
    { value: null, label: 'Qualquer período' },
    { value: y, label: 'Este ano' },
    { value: y - 4, label: 'Últimos 5 anos' },
    { value: y - 9, label: 'Últimos 10 anos' },
  ];
}

const hasActiveFilters = (f: SearchFiltersState) =>
  f.types.length > 0 || f.area !== null || f.openAccessOnly || f.yearFrom !== null;

export const SearchFilters = ({ filters, onChange }: SearchFiltersProps) => {
  const PERIOD_OPTIONS = getPeriodOptions();
  const isActive = hasActiveFilters(filters);

  const setType = (value: 'book' | 'article' | null) => {
    onChange({ ...filters, types: value === null ? [] : [value] });
  };

  const setArea = (area: string | null) => {
    onChange({ ...filters, area });
  };

  const toggleOpenAccess = () => {
    onChange({ ...filters, openAccessOnly: !filters.openAccessOnly });
  };

  const setPeriod = (yearFrom: number | null) => {
    onChange({ ...filters, yearFrom });
  };

  const reset = () => onChange({ types: [], area: null, openAccessOnly: false, yearFrom: null });

  const activeType = filters.types.length === 0 ? null : filters.types[0];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2 text-text-muted">
        <Filter className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs uppercase tracking-widest font-semibold">Filtros</span>
        {isActive && (
          <button
            type="button"
            onClick={reset}
            className="ml-auto flex items-center gap-1 text-xs text-primary hover:text-primary/70 font-medium transition-colors"
          >
            <X className="w-3 h-3" />
            Limpar
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-start">

        {/* Tipo */}
        <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1 shadow-sm">
          {TYPE_OPTIONS.map(opt => {
            const active = opt.value === activeType;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setType(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text hover:bg-surface-muted'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Área */}
        <div className="relative">
          <select
            value={filters.area ?? ''}
            onChange={e => setArea(e.target.value || null)}
            className={`h-9 pl-3 pr-8 text-xs font-medium rounded-xl border shadow-sm appearance-none bg-surface cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              filters.area
                ? 'border-primary text-primary bg-primary/5'
                : 'border-border text-text-muted hover:border-primary/50'
            }`}
          >
            <option value="">Todas as áreas</option>
            {AREAS.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>

        {/* Acesso Aberto */}
        <button
          type="button"
          onClick={toggleOpenAccess}
          className={`flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-xl border shadow-sm transition-all duration-150 ${
            filters.openAccessOnly
              ? 'bg-success-soft border-success-border text-success-strong'
              : 'bg-surface border-border text-text-muted hover:border-primary/50 hover:text-text'
          }`}
        >
          <Unlock className="w-3.5 h-3.5" />
          Acesso Aberto
        </button>

        {/* Período */}
        <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1 shadow-sm">
          {PERIOD_OPTIONS.map(opt => {
            const active = opt.value === filters.yearFrom;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text hover:bg-surface-muted'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
