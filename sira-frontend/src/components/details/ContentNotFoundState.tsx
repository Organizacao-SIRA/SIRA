import { ArrowLeft, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

interface ContentNotFoundStateProps {
  onBack: () => void;
}

export const ContentNotFoundState = ({ onBack }: ContentNotFoundStateProps) => {
  const { t } = useTranslation('details');

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] p-8 sm:p-20 text-center animate-fadeIn"
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-subtle text-text-subtle mb-5">
        <BookOpen className="w-8 h-8" aria-hidden="true" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-text mb-2">
        {t('notFound.title')}
      </h2>
      <p className="text-text-muted max-w-md mb-6 leading-relaxed">
        {t('notFound.description')}
      </p>
      <Button variant="primary" onClick={onBack}>
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        {t('notFound.action')}
      </Button>
    </div>
  );
};
