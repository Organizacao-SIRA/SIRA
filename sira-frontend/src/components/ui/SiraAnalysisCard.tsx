import { Sparkles } from 'lucide-react';

interface SiraAnalysisCardProps {
  explanation: string;
  size?: 'compact' | 'full';
}

export const SiraAnalysisCard = ({ explanation, size = 'full' }: SiraAnalysisCardProps) => {
  const isCompact = size === 'compact';

  return (
    <aside
      aria-label="Análise do SIRA+"
      className={`bg-accent-light dark:bg-accent/10 border-l-4 border-accent min-w-0 ${
        isCompact
          ? 'rounded-r-md px-2.5 py-1.5 sm:px-3 sm:py-2'
          : 'rounded-r-xl px-5 py-4 sm:px-6 sm:py-5'
      }`}
    >
      <div className={`flex items-center gap-1.5 ${isCompact ? 'mb-1' : 'mb-2'}`}>
        <Sparkles
          className={`shrink-0 text-accent-dark dark:text-accent ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`}
          aria-hidden="true"
        />
        <span className={`font-bold uppercase tracking-wider text-accent-dark dark:text-accent ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
          Análise do SIRA+
        </span>
      </div>
      <p className={`text-text break-words ${
        isCompact
          ? 'text-xs leading-snug line-clamp-2 min-w-0'
          : 'text-[15px] leading-relaxed'
      }`}>
        {explanation}
      </p>
    </aside>
  );
};
