import React from 'react';

interface AuthFormCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  mobileLogo?: React.ReactNode;
}

export const AuthFormCard = ({ title, subtitle, children, footer, mobileLogo }: AuthFormCardProps) => (
  <div className="bg-surface rounded-2xl shadow-lg border border-border overflow-hidden">
    <div className="p-7 md:p-8">
      {mobileLogo && (
        <div className="md:hidden flex justify-center mb-6">
          {mobileLogo}
        </div>
      )}

      <div className="mb-7">
        <h2 className="text-2xl font-bold text-primary-dark dark:text-text">{title}</h2>
        <p className="text-text-muted mt-1.5 text-sm">{subtitle}</p>
      </div>

      {children}
    </div>

    {footer && (
      <div className="bg-surface-muted px-7 py-4 text-center border-t border-border">
        {footer}
      </div>
    )}
  </div>
);
