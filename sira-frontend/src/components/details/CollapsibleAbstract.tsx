import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CollapsibleAbstractProps {
  abstract: string;
  headingId: string;
}

const MOBILE_COLLAPSE_THRESHOLD = 800;

export const CollapsibleAbstract = ({ abstract, headingId }: CollapsibleAbstractProps) => {
  const { t } = useTranslation('details');
  const [isExpanded, setIsExpanded] = useState(false);
  const canCollapseOnMobile = abstract.length > MOBILE_COLLAPSE_THRESHOLD;
  const isCollapsed = canCollapseOnMobile && !isExpanded;
  const contentId = `${headingId}-content`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2
          id={headingId}
          className="text-xs font-bold uppercase tracking-widest text-text-subtle"
        >
          {t('summary.title')}
        </h2>

        {canCollapseOnMobile && (
          <button
            type="button"
            aria-controls={contentId}
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded(value => !value)}
            className="lg:hidden inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-full border border-border-strong bg-surface px-3 text-xs font-bold text-primary shadow-sm transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]"
          >
            {isExpanded ? (
              <>
                <span>{t('summary.showLess')}</span>
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              </>
            ) : (
              <>
                <span>{t('summary.showMore')}</span>
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </>
            )}
          </button>
        )}
      </div>

      <p
        id={contentId}
        className={`text-text leading-[1.75] text-[17px] text-justify ${
          isCollapsed ? 'line-clamp-[10] lg:line-clamp-none' : ''
        }`}
      >
        {abstract}
      </p>
    </div>
  );
};
