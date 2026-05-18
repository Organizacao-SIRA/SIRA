import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface InterestCardProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  selected: boolean;
  onToggle: () => void;
}

export const InterestCard = ({ icon: Icon, label, description, selected, onToggle }: InterestCardProps) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={selected}
    title={description}
    className={`group relative flex flex-col items-center justify-center gap-2 p-3 sm:p-4 min-h-[100px] sm:min-h-[110px] rounded-xl border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
      selected
        ? 'border-primary bg-primary-soft shadow-sm'
        : 'border-border bg-surface-muted hover:border-border-strong hover:bg-surface'
    }`}
  >
    {selected && (
      <CheckCircle2
        className="absolute top-2 right-2 w-4 h-4 text-primary"
        aria-hidden="true"
      />
    )}
    <Icon
      className={`w-6 h-6 transition-colors ${
        selected ? 'text-primary' : 'text-text-subtle group-hover:text-text-muted'
      }`}
      aria-hidden="true"
    />
    <span
      className={`text-xs sm:text-sm font-bold leading-tight text-center ${
        selected ? 'text-primary' : 'text-text-muted'
      }`}
    >
      {label}
    </span>
  </button>
);
