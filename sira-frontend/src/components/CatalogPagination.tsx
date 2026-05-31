import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const CatalogPagination = ({ page, totalPages, total, onPageChange }: CatalogPaginationProps) => {
  const { t } = useTranslation('catalog');

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 gap-y-3 mt-6 sm:mt-8">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="p-2 rounded-lg border border-border-strong text-text-muted hover:text-primary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label={t('pagination.previous')}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex flex-wrap justify-center gap-1 max-w-full">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPageChange(i)}
            aria-label={t('pagination.goToPage', { page: i + 1 })}
            aria-current={i === page ? 'page' : undefined}
            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              i === page
                ? 'bg-primary text-white shadow-sm'
                : 'border border-border-strong text-text-muted hover:border-primary hover:text-primary hover:bg-primary-soft'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="p-2 rounded-lg border border-border-strong text-text-muted hover:text-primary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label={t('pagination.next')}
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <span className="text-xs text-text-muted ml-1 font-medium basis-full sm:basis-auto text-center sm:text-left">
        {t('pagination.results', { count: total })}
      </span>
    </div>
  );
};
