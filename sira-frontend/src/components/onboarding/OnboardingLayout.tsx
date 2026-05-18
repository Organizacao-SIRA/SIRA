import React from 'react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  progress: React.ReactNode;
  actions: React.ReactNode;
}

export const OnboardingLayout = ({ children, progress, actions }: OnboardingLayoutProps) => (
  <div className="h-[calc(100vh-68px)] flex items-stretch justify-center px-4 py-6 sm:py-10 bg-surface-muted animate-fadeIn">
    <div className="w-full max-w-xl sm:max-w-2xl lg:max-w-3xl flex flex-col">
      <div className="bg-surface rounded-2xl shadow-sm border border-border flex flex-col flex-1 overflow-hidden">
        <header className="px-5 py-4 sm:px-8 sm:py-5 border-b border-border flex-shrink-0">
          {progress}
        </header>

        <main className="px-5 py-6 sm:px-8 sm:py-8 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
          {children}
        </main>

        <footer className="px-5 py-4 sm:px-8 sm:py-5 border-t border-border bg-surface-muted/40 flex-shrink-0">
          {actions}
        </footer>
      </div>
    </div>
  </div>
);
