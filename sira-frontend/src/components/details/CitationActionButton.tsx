import { Check, Quote } from 'lucide-react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useClipboard } from '../../hooks/useClipboard';
import type { CatalogItem } from '../../types';

interface CitationActionButtonProps {
  item: CatalogItem;
}

const buildCitation = (item: CatalogItem, t: TFunction<'details'>): string => {
  const authors = item.authors?.trim() || t('citation.unknownAuthor');
  const year = String(item.year ?? '').trim() || t('citation.noDate');
  const title = item.title?.trim() || t('citation.noTitle');
  const source = item.source?.trim() || '';

  const sourcePart = source ? `. ${source}` : '';
  const doiPart = item.doi ? `. DOI: ${item.doi.replace(/^https?:\/\/doi\.org\//, '')}` : '';

  return `${authors} (${year}). ${title}${sourcePart}${doiPart}.`;
};

const hasEnoughData = (item: CatalogItem) =>
  Boolean(item.authors?.trim() && item.title?.trim() && String(item.year ?? '').trim());

export const CitationActionButton = ({ item }: CitationActionButtonProps) => {
  const { t } = useTranslation('details');
  const { copied, copy } = useClipboard();

  if (!hasEnoughData(item)) return null;

  const handleClick = () => {
    void copy(buildCitation(item, t));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={copied ? t('citation.copiedLabel') : t('citation.copyLabel')}
      aria-live="polite"
      className="w-full min-h-[52px] px-4 py-3 rounded-xl border-2 border-border-strong bg-surface hover:border-primary hover:bg-primary-soft text-text hover:text-primary font-semibold transition-all flex items-center justify-center gap-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-success" aria-hidden="true" />
          <span className="text-success">{t('citation.copied')}</span>
        </>
      ) : (
        <>
          <Quote className="w-4 h-4" aria-hidden="true" />
          <span>{t('citation.copy')}</span>
        </>
      )}
    </button>
  );
};
