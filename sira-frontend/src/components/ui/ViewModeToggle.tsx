import { LayoutGrid, Rows3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ViewMode } from '../../hooks/useViewMode';

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

const OPTIONS: Array<{ value: ViewMode; icon: typeof Rows3; labelKey: string }> = [
  { value: 'horizontal', icon: Rows3, labelKey: 'viewMode.horizontal' },
  { value: 'vertical', icon: LayoutGrid, labelKey: 'viewMode.vertical' },
];

export const ViewModeToggle = ({ mode, onChange, className = '' }: ViewModeToggleProps) => {
  const { t } = useTranslation('common');

  return (
    <div
      role="radiogroup"
      aria-label={t('viewMode.label')}
      className={`inline-flex items-center gap-1 bg-surface-subtle border border-border rounded-lg p-1 ${className}`}
    >
      {OPTIONS.map(({ value, icon: Icon, labelKey }) => {
        const active = mode === value;
        const label = t(labelKey);
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => onChange(value)}
            className={`p-1.5 rounded-md transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/50 ${
              active
                ? 'bg-surface text-link shadow-sm'
                : 'text-text-subtle hover:text-text-muted'
            }`}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
};
