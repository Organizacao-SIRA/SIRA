import { Calendar, Globe, UserCircle } from 'lucide-react';
import { MaterialTypeBadge } from '../ui/MaterialTypeBadge';

interface ContentHeroProps {
  type: 'book' | 'article';
  title: string;
  authors: string;
  year: string;
  source: string;
}

export const ContentHero = ({ type, title, authors, year, source }: ContentHeroProps) => (
  <header className="space-y-4 sm:space-y-5">
    <MaterialTypeBadge type={type} />

    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-dark dark:text-text leading-tight italic break-words">
      {title}
    </h1>

    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
      <span className="flex items-center gap-2 min-w-0">
        <UserCircle className="w-4 h-4 text-text-subtle flex-shrink-0" aria-hidden="true" />
        <span className="sr-only">Autores:</span>
        <span className="font-medium text-text break-words">{authors}</span>
      </span>
      <span className="text-text-subtle" aria-hidden="true">·</span>
      <span className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-text-subtle flex-shrink-0" aria-hidden="true" />
        <span className="sr-only">Ano:</span>
        <span className="font-medium text-text">{year}</span>
      </span>
      <span className="text-text-subtle" aria-hidden="true">·</span>
      <span className="flex items-center gap-2 min-w-0">
        <Globe className="w-4 h-4 text-text-subtle flex-shrink-0" aria-hidden="true" />
        <span className="sr-only">Fonte:</span>
        <span className="font-medium text-text break-words">{source}</span>
      </span>
    </div>
  </header>
);
