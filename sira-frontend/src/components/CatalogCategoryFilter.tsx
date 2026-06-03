import { useTranslation } from 'react-i18next';
import type { PreferenceTopic } from '../types';
import { preferenceTopicLabel } from '../i18n/preferenceLabels';

interface CatalogCategoryFilterProps {
  categories: PreferenceTopic[];
  selected: string;
  onSelect: (id: string) => void;
}

interface PillProps {
  id: string;
  label: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

const CategoryPill = ({ id, label, selected, onSelect }: PillProps) => (
  <button
    type="button"
    onClick={() => onSelect(id)}
    aria-pressed={selected}
    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 ${
      selected
        ? 'bg-primary text-white border-primary shadow-sm'
        : 'bg-surface border-border-strong text-text-muted hover:border-link hover:text-link'
    }`}
  >
    {label}
  </button>
);

export const CatalogCategoryFilter = ({
  categories,
  selected,
  onSelect,
}: CatalogCategoryFilterProps) => {
  const { t } = useTranslation('catalog');
  const { t: tPref } = useTranslation('preferences');

  return (
    <div
      aria-label={t('categories.label')}
      className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <CategoryPill id="all" label={t('categories.all')} selected={selected === 'all'} onSelect={onSelect} />
      {categories.map(cat => (
        <CategoryPill
          key={cat.id}
          id={cat.id}
          label={preferenceTopicLabel(cat, tPref)}
          selected={selected === cat.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};
