import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
}

export const PageHeader = ({ icon: Icon, title, subtitle, badge }: PageHeaderProps) => (
  <div className="mb-8">
    <div className="flex items-center gap-3">
      <div className="p-2.5 bg-primary rounded-lg flex-shrink-0 shadow-sm">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-primary-dark dark:text-text">{title}</h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-text-muted mt-0.5 font-medium text-sm">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);
