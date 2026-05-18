import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const CatalogPagination = ({ page, totalPages, total, onPageChange }: CatalogPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="p-2 rounded-lg border border-border-strong text-text-muted hover:text-primary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer active:scale-[0.98]"
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer active:scale-[0.98] ${
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
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="p-2 rounded-lg border border-border-strong text-text-muted hover:text-primary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer active:scale-[0.98]"
        aria-label="Próxima página"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <span className="text-xs text-text-muted ml-1 font-medium">
        {total} {total === 1 ? 'resultado' : 'resultados'}
      </span>
    </div>
  );
};
