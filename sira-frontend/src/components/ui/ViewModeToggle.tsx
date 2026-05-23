import { LayoutGrid, Rows3 } from 'lucide-react';
import type { ViewMode } from '../../hooks/useViewMode';

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

const OPTIONS: Array<{ value: ViewMode; icon: typeof Rows3; label: string }> = [
  { value: 'horizontal', icon: Rows3, label: 'Lista horizontal' },
  { value: 'vertical', icon: LayoutGrid, label: 'Grade vertical' },
];

export const ViewModeToggle = ({ mode, onChange, className = '' }: ViewModeToggleProps) => (
  <div
    role="radiogroup"
    aria-label="Modo de visualização"
    className={`inline-flex items-center gap-1 bg-surface-subtle border border-border rounded-lg p-1 ${className}`}
  >
    {OPTIONS.map(({ value, icon: Icon, label }) => {
      const active = mode === value;
      return (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={active}
          aria-label={label}
          title={label}
          onClick={() => onChange(value)}
          className={`p-1.5 rounded-md transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            active
              ? 'bg-surface text-primary shadow-sm'
              : 'text-text-subtle hover:text-text-muted'
          }`}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </button>
      );
    })}
  </div>
);
