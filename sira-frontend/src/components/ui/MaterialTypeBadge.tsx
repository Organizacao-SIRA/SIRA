import { BookOpen, FileText } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface MaterialTypeBadgeProps {
  type: 'book' | 'article';
}

export const MaterialTypeBadge = ({ type }: MaterialTypeBadgeProps) => {
  if (type === 'article') {
    return (
      <StatusBadge variant="info" icon={<FileText className="w-3 h-3" />}>
        Artigo
      </StatusBadge>
    );
  }
  return (
    <StatusBadge variant="warning" icon={<BookOpen className="w-3 h-3" />}>
      Livro
    </StatusBadge>
  );
};
