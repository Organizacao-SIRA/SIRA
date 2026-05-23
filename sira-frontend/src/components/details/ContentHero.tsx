import { useState } from 'react';
import { MaterialTypeBadge } from '../ui/MaterialTypeBadge';
import { StatusBadge } from '../ui/StatusBadge';

interface ContentHeroProps {
  type: 'book' | 'article';
  title: string;
  authors: string;
  year: string;
  source: string;
  provider?: string;
}

const AUTHOR_CHAR_THRESHOLD = 50;

export const ContentHero = ({ type, title, authors, year, source, provider }: ContentHeroProps) => {
  const isLong = authors.length > AUTHOR_CHAR_THRESHOLD;
  const [expanded, setExpanded] = useState(false);

  return (
    <header className="space-y-5 sm:space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <MaterialTypeBadge type={type} />
        {provider && <StatusBadge variant="info">{provider}</StatusBadge>}
        {source && source !== provider && <StatusBadge variant="neutral">{source}</StatusBadge>}
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-dark dark:text-text leading-[1.15] tracking-tight break-words">
        {title}
      </h1>

      <div className="text-base text-text-muted">
        <span className="sr-only">Autores: </span>
        <span className={`font-medium text-text${isLong && !expanded ? ' line-clamp-1' : ''}`}>
          {authors}
        </span>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="block text-xs text-primary hover:text-primary-dark dark:hover:text-primary transition-colors mt-1 cursor-pointer font-semibold"
          >
            {expanded ? 'ver menos ↑' : 'ver todos os autores ↓'}
          </button>
        )}
        <div className="mt-1 text-sm text-text-subtle">
          <span className="sr-only">Ano: </span>
          {year}
        </div>
      </div>
    </header>
  );
};
