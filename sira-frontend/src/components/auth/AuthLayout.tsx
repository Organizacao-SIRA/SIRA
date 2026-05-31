import React from 'react';
import { AuthVisualPanel } from './AuthVisualPanel';
import { LanguageToggle } from '../ui/LanguageToggle';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="min-h-[calc(100vh-68px)] flex bg-surface-muted animate-fadeIn relative">
    <div className="absolute right-4 top-4 z-10 sm:right-6">
      <LanguageToggle />
    </div>
    <AuthVisualPanel />
    <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  </div>
);
