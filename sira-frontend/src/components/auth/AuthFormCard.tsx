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
    <div className="p-6 sm:p-7">
      {mobileLogo && (
        <div className="lg:hidden flex justify-center mb-5">
          {mobileLogo}
        </div>
      )}

      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-primary-dark dark:text-text">{title}</h2>
        <p className="text-text-muted mt-1 text-sm">{subtitle}</p>
      </div>

      {children}
    </div>

    {footer && (
      <div className="bg-surface-muted px-6 sm:px-7 py-3 text-center border-t border-border">
        {footer}
      </div>
    )}
  </div>
);
