import React from 'react';

interface SelectableCardProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const SelectableCard = ({ selected, onClick, children, className = '' }: SelectableCardProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`p-4 rounded-xl border-2 transition-all text-left w-full ${
      selected
        ? 'border-selected-border bg-selected'
        : 'border-border bg-surface-muted hover:bg-surface hover:border-border-strong'
    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 ${className}`}
  >
    {children}
  </button>
);
