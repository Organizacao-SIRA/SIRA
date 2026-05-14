import React from 'react';
import { Bot } from 'lucide-react';

interface AiMessageBubbleProps {
  message: string;
  children?: React.ReactNode;
}

export const AiMessageBubble = ({ message, children }: AiMessageBubbleProps) => (
  <div className="flex gap-4 animate-fadeIn">
    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
      <Bot className="w-6 h-6 text-primary" />
    </div>
    <div className="flex-1 space-y-6">
      <div className="bg-white border border-gray-100 p-5 rounded-2xl rounded-tl-none shadow-sm">
        <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>
      {children}
    </div>
  </div>
);
