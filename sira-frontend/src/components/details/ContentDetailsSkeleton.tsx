import { useTranslation } from 'react-i18next';
import { Skeleton } from '../ui/Skeleton';

export const ContentDetailsSkeleton = () => {
  const { t } = useTranslation('details');

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t('loading.details')}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fadeIn"
    >
    <Skeleton className="h-5 w-48 mb-6" />

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 space-y-4">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-5 sm:p-8 space-y-3">
          <Skeleton className="h-6 w-48 mb-3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    </div>
    </div>
  );
};
