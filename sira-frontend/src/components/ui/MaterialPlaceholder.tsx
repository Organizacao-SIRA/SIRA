import { Book, FileText } from 'lucide-react';

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
  const isBook = type === 'book';
  const Icon = isBook ? Book : FileText;

  return (
    <div
      role="img"
      aria-label={isBook ? 'Capa indisponível' : 'Imagem indisponível'}
      className={`flex items-center justify-center rounded-lg border ${
        isBook
          ? 'bg-primary-soft border-primary/30 text-primary'
          : 'bg-info-soft border-info-border text-info-strong'
      } ${className}`}
    >
      <Icon className={iconClassName} aria-hidden="true" />
    </div>
  );
};
