import React from 'react';

interface PreferenceGroupProps {
  title: string;
  description?: string;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const PreferenceGroup = ({ title, description, error, icon, children }: PreferenceGroupProps) => (
  <section className="space-y-3">
    <div className="flex items-start gap-2">
      {icon && <span className="text-link mt-0.5">{icon}</span>}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-primary-dark dark:text-text">{title}</h3>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="flex flex-wrap gap-2">{children}</div>
    {error && <p className="text-xs text-danger-strong font-medium">{error}</p>}
  </section>
);
