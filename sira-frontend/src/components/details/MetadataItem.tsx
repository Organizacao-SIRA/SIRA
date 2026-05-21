import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface MetadataItemProps {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
  className?: string;
}

export const MetadataItem = ({ icon: Icon, label, children, className = '' }: MetadataItemProps) => (
  <div className={`flex items-start gap-3 min-w-0 ${className}`}>
    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-subtle text-primary flex-shrink-0">
      <Icon className="w-4 h-4" aria-hidden="true" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-bold uppercase tracking-wider text-text-subtle mb-1">
        {label}
      </p>
      <div className="text-sm text-text break-words font-medium">
        {children}
      </div>
    </div>
  </div>
);
