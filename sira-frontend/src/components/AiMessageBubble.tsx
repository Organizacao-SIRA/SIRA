import React from 'react';
import { Bot } from 'lucide-react';

interface AiMessageBubbleProps {
  message: string;
  children?: React.ReactNode;
}

export const AiMessageBubble = ({ message, children }: AiMessageBubbleProps) => (
  <div className="flex gap-4 animate-fadeIn">
    <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0 shadow-sm">
      <Bot className="w-6 h-6 text-primary" />
    </div>
    <div className="flex-1 space-y-6">
      <div className="bg-surface border border-border p-5 rounded-2xl rounded-tl-none shadow-sm">
        <p className="text-text text-sm md:text-base leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>
      {children}
    </div>
  </div>
);
