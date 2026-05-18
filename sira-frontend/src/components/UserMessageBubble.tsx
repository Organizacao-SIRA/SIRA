import { UserAvatar } from './ui/UserAvatar';
import type { AuthUser } from '../types';

interface UserMessageBubbleProps {
  message: string;
  user?: AuthUser | null;
}

export const UserMessageBubble = ({ message, user }: UserMessageBubbleProps) => (
  <div className="flex gap-4 animate-fadeIn justify-end">
    <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] md:max-w-2xl">
      <p className="text-sm md:text-base leading-relaxed font-medium">{message}</p>
    </div>
    <UserAvatar
      name={user?.name || '?'}
      imageUrl={user?.avatarUrl}
      size="md"
      className="flex-shrink-0 shadow-sm"
    />
  </div>
);
