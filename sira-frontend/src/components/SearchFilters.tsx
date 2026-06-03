import { Filter, X, BookOpen, FileText, Unlock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SearchFilters as SearchFiltersState } from '../types';

const AREAS = [
  { value: 'ia', labelKey: 'filters.areas.ia' },
  { value: 'cd', labelKey: 'filters.areas.cd' },
  { value: 'edu', labelKey: 'filters.areas.edu' },
  { value: 'sau', labelKey: 'filters.areas.sau' },
  { value: 'dir', labelKey: 'filters.areas.dir' },
  { value: 'eco', labelKey: 'filters.areas.eco' },
  { value: 'soc', labelKey: 'filters.areas.soc' },
  { value: 'amb', labelKey: 'filters.areas.amb' },
  { value: 'gp', labelKey: 'filters.areas.gp' },
];

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onChange: (filters: SearchFiltersState) => void;
}

type TypeOption = { value: 'book' | 'article' | null; labelKey: string; icon: React.ReactNode };

const TYPE_OPTIONS: TypeOption[] = [
  { value: null, labelKey: 'filters.allTypes', icon: null },
  { value: 'book', labelKey: 'filters.books', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { value: 'article', labelKey: 'filters.articles', icon: <FileText className="w-3.5 h-3.5" /> },
];

function getPeriodOptions() {
  const y = new Date().getFullYear();
  return [
    { value: null, labelKey: 'filters.anyPeriod' },
    { value: y, labelKey: 'filters.thisYear' },
    { value: y - 4, labelKey: 'filters.lastFiveYears' },
    { value: y - 9, labelKey: 'filters.lastTenYears' },
  ];
}

const hasActiveFilters = (f: SearchFiltersState) =>
  f.types.length > 0 || f.area !== null || f.openAccessOnly || f.yearFrom !== null;

export const SearchFilters = ({ filters, onChange }: SearchFiltersProps) => {
  const { t } = useTranslation('catalog');
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
        <span className="text-xs uppercase tracking-widest font-semibold">{t('filters.label')}</span>
        {isActive && (
          <button
            type="button"
            onClick={reset}
            className="ml-auto flex items-center gap-1 text-xs text-link hover:text-link-hover font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 rounded px-1 py-0.5"
          >
            <X className="w-3 h-3" />
            {t('filters.clear')}
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
                aria-pressed={active}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 ${
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text hover:bg-surface-muted'
                }`}
              >
                {opt.icon}
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>

        {/* Área */}
        <div className="relative">
          <select
            value={filters.area ?? ''}
            onChange={e => setArea(e.target.value || null)}
            className={`h-9 pl-3 pr-8 text-xs font-medium rounded-xl border shadow-sm appearance-none bg-surface cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-focus/30 ${
              filters.area
                ? 'border-selected-border text-link bg-selected'
                : 'border-border text-text-muted hover:border-link/50'
            }`}
          >
            <option value="">{t('filters.allAreas')}</option>
            {AREAS.map(a => (
              <option key={a.value} value={a.value}>{t(a.labelKey)}</option>
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
          aria-pressed={filters.openAccessOnly}
          className={`flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-xl border shadow-sm transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 ${
            filters.openAccessOnly
              ? 'bg-success-soft border-success-border text-success-strong'
              : 'bg-surface border-border text-text-muted hover:border-link/50 hover:text-text'
          }`}
        >
          <Unlock className="w-3.5 h-3.5" />
          {t('filters.openAccess')}
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
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 ${
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text hover:bg-surface-muted'
                }`}
              >
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
