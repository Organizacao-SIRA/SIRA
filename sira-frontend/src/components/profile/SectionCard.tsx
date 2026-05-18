import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface SectionCardProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  className?: string;
}

export const SectionCard = ({ icon: Icon, title, children, className = '' }: SectionCardProps) => (
  <div className={`bg-surface rounded-2xl border border-border shadow-sm overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-border bg-surface-muted/30 flex items-center gap-2.5">
      <div className="p-1.5 bg-primary rounded-md flex-shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h3 className="font-bold text-primary-dark dark:text-text">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);
