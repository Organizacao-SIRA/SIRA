import React from 'react';

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  variant?: StatusVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<StatusVariant, string> = {
  success: 'bg-success-soft text-success-strong border-success-border',
  warning: 'bg-warning-soft text-warning-strong border-warning-border',
  danger: 'bg-danger-soft text-danger-strong border-danger-border',
  info: 'bg-info-soft text-info-strong border-info-border',
  neutral: 'bg-surface-subtle text-text-muted border-border-strong',
};

export const StatusBadge = ({ variant = 'neutral', icon, children, className = '' }: StatusBadgeProps) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
    {icon}
    {children}
  </span>
);
