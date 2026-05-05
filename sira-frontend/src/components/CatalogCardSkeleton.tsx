import React from 'react';
import { Skeleton } from './ui/Skeleton';

export const CatalogCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[380px]">
      {/* Imagem Cover Area Skeleton */}
      <div className="h-40 w-full relative bg-gray-100">
        <Skeleton className="w-full h-full rounded-none opacity-50" />
        <div className="absolute top-2 left-2">
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
        <div className="absolute top-2 right-2">
          <Skeleton className="w-10 h-4 rounded" />
        </div>
      </div>
      
      {/* Content Area Skeleton */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <Skeleton className="w-16 h-5 rounded" />
        </div>

        <Skeleton className="w-full h-5 mb-2" />
        <Skeleton className="w-4/5 h-5 mb-4" />
        
        <Skeleton className="w-1/2 h-3 mb-6" />
        
        {/* Footer Area Skeleton */}
        <div className="mt-auto pt-4 border-t border-gray-50 space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="w-12 h-3" />
            <Skeleton className="w-20 h-4" />
          </div>
          <Skeleton className="w-full h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
