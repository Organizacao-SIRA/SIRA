import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MaterialTypeBadge } from '../ui/MaterialTypeBadge';
import { StatusBadge } from '../ui/StatusBadge';

interface ContentHeroProps {
  type: 'book' | 'article';
  title: string;
  authors: string;
  year: string;
  source: string;
  provider?: string;
  isOpenAccess?: boolean;
}

const AUTHOR_CHAR_THRESHOLD = 50;

export const ContentHero = ({ type, title, authors, year, source, provider, isOpenAccess }: ContentHeroProps) => {
  const { t } = useTranslation(['details', 'common']);
  const isLong = authors.length > AUTHOR_CHAR_THRESHOLD;
  const [expanded, setExpanded] = useState(false);

  return (
    <header className="space-y-5 sm:space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <MaterialTypeBadge type={type} />
        {provider && <StatusBadge variant="info">{provider}</StatusBadge>}
        {source && source !== provider && <StatusBadge variant="neutral">{source}</StatusBadge>}
        {isOpenAccess === true && (
          <StatusBadge variant="success" icon={<Unlock className="w-3 h-3" />}>
            {t('common:access.openFull')}
          </StatusBadge>
        )}
        {isOpenAccess === false && (
          <StatusBadge variant="warning" icon={<Lock className="w-3 h-3" />}>
            {t('common:access.restrictedFull')}
          </StatusBadge>
        )}
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-dark dark:text-text leading-[1.15] tracking-tight break-words">
        {title}
      </h1>

      <div className="text-base text-text-muted">
        <span className="sr-only">{t('hero.authorsLabel')} </span>
        <span className={`font-medium text-text${isLong && !expanded ? ' line-clamp-1' : ''}`}>
          {authors}
        </span>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="block text-xs text-link hover:text-link-hover transition-colors mt-1 cursor-pointer font-semibold"
          >
            {expanded ? t('hero.showLess') : t('hero.showAll')}
          </button>
        )}
        <div className="mt-1 text-sm text-text-subtle">
          <span className="sr-only">{t('hero.yearLabel')} </span>
          {year}
        </div>
      </div>
    </header>
  );
};
