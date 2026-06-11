import { Check } from 'lucide-react';

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  /** Read-only: mantém a aparência da seleção, mas sem clique nem hover. */
  disabled?: boolean;
}

/**
 * Pílula selecionável (toggle) — fonte única compartilhada entre onboarding e
 * configurações. Usa os mesmos tokens de seleção (`bg-selected`/`text-link`)
 * do restante do sistema. `disabled` deixa o chip somente-leitura sem apagá-lo.
 */
export const SelectableChip = ({ label, selected, onToggle, disabled = false }: SelectableChipProps) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={disabled}
    aria-pressed={selected}
    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 ${
      disabled ? 'cursor-default' : 'cursor-pointer'
    } ${
      selected
        ? 'border-selected-border bg-selected text-link'
        : `border-border bg-surface text-text-muted ${disabled ? '' : 'hover:border-border-strong hover:text-text'}`
    }`}
  >
    {selected && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
    {label}
  </button>
);
