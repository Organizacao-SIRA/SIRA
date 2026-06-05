import { Book, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MaterialPlaceholderProps {
  type: 'book' | 'article';
  className?: string;
  iconClassName?: string;
}

export const MaterialPlaceholder = ({
  type,
  className = '',
  iconClassName = 'w-7 h-7',
}: MaterialPlaceholderProps) => {
  const { t } = useTranslation('common');
  const isBook = type === 'book';
  const Icon = isBook ? Book : FileText;

  return (
    <div
      role="img"
      aria-label={isBook ? t('materialPlaceholder.bookUnavailable') : t('materialPlaceholder.articleUnavailable')}
      className={`flex items-center justify-center rounded-lg border ${
        isBook
          ? 'bg-primary-soft border-link/30 text-link'
          : 'bg-info-soft border-info-border text-info-strong'
      } ${className}`}
    >
      <Icon className={iconClassName} aria-hidden="true" />
    </div>
  );
};
