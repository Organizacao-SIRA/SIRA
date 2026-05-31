import { BookOpen, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from './StatusBadge';

interface MaterialTypeBadgeProps {
  type: 'book' | 'article';
}

export const MaterialTypeBadge = ({ type }: MaterialTypeBadgeProps) => {
  const { t } = useTranslation('common');

  if (type === 'article') {
    return (
      <StatusBadge variant="info" icon={<FileText className="w-3 h-3" />}>
        {t('materialTypes.article')}
      </StatusBadge>
    );
  }
  return (
    <StatusBadge variant="warning" icon={<BookOpen className="w-3 h-3" />}>
      {t('materialTypes.book')}
    </StatusBadge>
  );
};
