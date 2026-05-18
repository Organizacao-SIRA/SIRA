import { Check } from 'lucide-react';

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const SelectableChip = ({ label, selected, onToggle, disabled = false }: SelectableChipProps) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={disabled}
    aria-pressed={selected}
    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
      selected
        ? 'border-primary bg-primary-soft text-primary'
        : 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text'
    } disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {selected && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
    {label}
  </button>
);
