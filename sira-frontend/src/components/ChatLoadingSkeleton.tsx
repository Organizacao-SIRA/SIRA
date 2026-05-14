import { Bot } from 'lucide-react';

export const ChatLoadingSkeleton = () => (
  <div className="flex gap-4 animate-pulse">
    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
      <Bot className="w-6 h-6 text-primary" />
    </div>
    <div className="flex-1 space-y-4">
      <div className="h-20 bg-gray-200 rounded-2xl w-full" />
      <div className="space-y-4 pt-4">
        <div className="h-32 bg-gray-100 rounded-2xl w-full" />
        <div className="h-32 bg-gray-100 rounded-2xl w-full" />
      </div>
    </div>
  </div>
);
