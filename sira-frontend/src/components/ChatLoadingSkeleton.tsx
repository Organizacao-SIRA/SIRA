export const ChatLoadingSkeleton = () => (
  <div className="flex gap-4 animate-pulse">
    <div className="w-10 h-10 rounded-full sira-card flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 30 30" fill="currentColor" className="w-6 h-6 text-accent" aria-hidden="true">
        <rect x="11" y="0" width="8" height="30" />
        <rect x="0" y="11" width="30" height="8" />
      </svg>
    </div>
    <div className="flex-1 space-y-4">
      <div className="h-20 bg-surface-subtle rounded-2xl w-full" />
      <div className="space-y-4 pt-4">
        <div className="h-32 bg-surface-subtle rounded-2xl w-full" />
        <div className="h-32 bg-surface-subtle rounded-2xl w-full" />
      </div>
    </div>
  </div>
);
