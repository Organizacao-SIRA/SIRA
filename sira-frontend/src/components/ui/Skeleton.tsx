
interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div className={`animate-pulse bg-surface-subtle rounded ${className}`} aria-hidden="true" />
  );
};
