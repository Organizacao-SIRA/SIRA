import React from 'react';
import { AuthVisualPanel } from './AuthVisualPanel';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="min-h-[calc(100vh-68px)] flex bg-surface-muted animate-fadeIn">
    <AuthVisualPanel />
    <div className="flex-1 flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  </div>
);
