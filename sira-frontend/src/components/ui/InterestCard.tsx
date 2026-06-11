import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface InterestCardProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  selected: boolean;
  onToggle: () => void;
  /** Modo read-only: mantém a seleção visível, mas sem clique nem hover. */
  disabled?: boolean;
}

/**
 * Tile único de "área de interesse" — fonte de verdade compartilhada entre o
 * onboarding e a página de configurações. Qualquer mudança de visual/seleção
 * propaga para as duas telas. A config usa `disabled` para o estado read-only.
 */
export const InterestCard = ({
  icon: Icon,
  label,
  description,
  selected,
  onToggle,
  disabled = false,
}: InterestCardProps) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={disabled}
    aria-pressed={selected}
    title={description}
    className={`group relative flex flex-col items-center justify-center gap-2 p-3 sm:p-4 min-h-[100px] sm:min-h-[110px] rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 ${
      disabled ? 'cursor-default' : 'cursor-pointer'
    } ${
      selected
        ? 'border-selected-border bg-selected shadow-sm'
        : `border-border bg-surface-muted ${disabled ? '' : 'hover:border-border-strong hover:bg-surface'}`
    }`}
  >
    {selected && (
      <CheckCircle2
        className="absolute top-2 right-2 w-4 h-4 text-link"
        aria-hidden="true"
      />
    )}
    <Icon
      className={`w-6 h-6 transition-colors ${
        selected ? 'text-link' : 'text-text-subtle group-hover:text-text-muted'
      }`}
      aria-hidden="true"
    />
    <span
      className={`text-xs sm:text-sm font-bold leading-tight text-center ${
        selected ? 'text-link' : 'text-text-muted'
      }`}
    >
      {label}
    </span>
  </button>
);
