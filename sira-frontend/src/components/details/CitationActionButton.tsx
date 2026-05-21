import { Check, Quote } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';
import type { CatalogItem } from '../../types';

interface CitationActionButtonProps {
  item: CatalogItem;
}

const buildCitation = (item: CatalogItem): string => {
  const authors = item.authors?.trim() || 'Autor desconhecido';
  const year = item.year?.trim() || 's.d.';
  const title = item.title?.trim() || 'Sem título';
  const source = item.source?.trim() || '';

  const sourcePart = source ? `. ${source}` : '';
  const doiPart = item.doi ? `. DOI: ${item.doi.replace(/^https?:\/\/doi\.org\//, '')}` : '';

  return `${authors} (${year}). ${title}${sourcePart}${doiPart}.`;
};

const hasEnoughData = (item: CatalogItem) =>
  Boolean(item.authors?.trim() && item.title?.trim() && item.year?.trim());

export const CitationActionButton = ({ item }: CitationActionButtonProps) => {
  const { copied, copy } = useClipboard();

  if (!hasEnoughData(item)) return null;

  const handleClick = () => {
    void copy(buildCitation(item));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={copied ? 'Citação copiada' : 'Copiar citação simplificada'}
      aria-live="polite"
      className="w-full py-3 px-4 rounded-xl border-2 border-border-strong bg-surface hover:border-primary hover:bg-primary-soft text-text hover:text-primary font-semibold transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-success" aria-hidden="true" />
          <span className="text-success">Citação copiada</span>
        </>
      ) : (
        <>
          <Quote className="w-4 h-4" aria-hidden="true" />
          <span>Copiar Citação</span>
        </>
      )}
    </button>
  );
};
