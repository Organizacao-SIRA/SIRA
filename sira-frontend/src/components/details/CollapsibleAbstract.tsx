import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

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
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-controls={contentId}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? t('summary.showLess') : t('summary.showMore')}
            onClick={() => setIsExpanded(value => !value)}
            className="lg:hidden h-10 w-10 shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
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
