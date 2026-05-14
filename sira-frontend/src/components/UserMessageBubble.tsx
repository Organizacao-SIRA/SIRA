import { User } from 'lucide-react';

interface UserMessageBubbleProps {
  message: string;
}

export const UserMessageBubble = ({ message }: UserMessageBubbleProps) => (
  <div className="flex gap-4 animate-fadeIn justify-end">
    <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] md:max-w-2xl">
      <p className="text-sm md:text-base leading-relaxed font-medium">{message}</p>
    </div>
    <div className="w-10 h-10 rounded-full bg-primary-dark flex items-center justify-center flex-shrink-0 shadow-sm">
      <User className="w-5 h-5 text-white" />
    </div>
  </div>
);
