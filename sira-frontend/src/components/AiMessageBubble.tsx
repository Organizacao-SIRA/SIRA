import React from 'react';

interface AiMessageBubbleProps {
  message: string;
  children?: React.ReactNode;
}

export const AiMessageBubble = ({ message, children }: AiMessageBubbleProps) => (
  <div className="flex flex-col gap-6 animate-fadeIn min-w-0">
    <div className="flex gap-3 sm:gap-4 min-w-0">
      <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0 shadow-sm">
        <svg viewBox="0 0 30 30" fill="currentColor" className="w-6 h-6 text-accent" aria-hidden="true">
          <rect x="11" y="0" width="8" height="30" />
          <rect x="0" y="11" width="30" height="8" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-surface border border-border p-4 sm:p-5 rounded-2xl rounded-tl-none shadow-sm">
          <p className="text-text text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">{message}</p>
        </div>
      </div>
    </div>
    {children && <div className="min-w-0">{children}</div>}
  </div>
);
