import { useTranslation } from 'react-i18next';
import { CollapsibleAbstract } from './CollapsibleAbstract';

interface AcademicSummarySectionProps {
  abstract?: string;
  keywords?: string[];
}

export const AcademicSummarySection = ({ abstract, keywords }: AcademicSummarySectionProps) => {
  const { t } = useTranslation('details');
  const hasAbstract = abstract && abstract.trim().length > 0;
  const hasKeywords = keywords && keywords.length > 0;

  if (!hasAbstract && !hasKeywords) return null;

  return (
    <section aria-labelledby="academic-summary-heading" className="space-y-8">
      {hasAbstract ? (
        <CollapsibleAbstract
          abstract={abstract}
          headingId="academic-summary-heading"
        />
      ) : (
        <div className="space-y-3">
          <h2
            id="academic-summary-heading"
            className="text-xs font-bold uppercase tracking-widest text-text-subtle"
          >
            {t('summary.title')}
          </h2>
          <p className="text-sm text-text-subtle italic">
            {t('summary.unavailable')}
          </p>
        </div>
      )}

      {hasKeywords && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-subtle">
            {t('summary.keywords')}
          </h3>
          <ul className="flex flex-wrap gap-2" aria-label={t('summary.keywordsLabel')}>
            {keywords!.map((kw, idx) => (
              <li
                key={`${kw}-${idx}`}
                className="bg-surface-subtle text-text-muted px-3 py-1 rounded-full text-sm font-medium border border-border"
              >
                #{kw}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
