import { Skeleton } from './ui/Skeleton';

export const RecommendationCardSkeleton = () => {
  return (
    <div className="sira-card-strong p-6 rounded-lg">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2">
          <Skeleton className="w-16 h-6 rounded" />
          <Skeleton className="w-20 h-6 rounded" />
        </div>
        <Skeleton className="w-24 h-6 rounded" />
      </div>

      <Skeleton className="w-3/4 h-7 mb-2" />
      <Skeleton className="w-1/3 h-5 mb-4" />

      <Skeleton className="w-full h-4 mb-2" />
      <Skeleton className="w-5/6 h-4 mb-4" />

      <div className="flex items-start gap-2 bg-info-soft border border-info-border rounded-xl px-4 py-3 mb-4">
        <Skeleton className="w-4 h-4 rounded-full mt-0.5" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <Skeleton className="w-32 h-10 rounded-lg" />
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>
    </div>
  );
};
