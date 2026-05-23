import { Sparkles } from 'lucide-react';

interface SiraAnalysisCardProps {
  explanation: string;
}

export const SiraAnalysisCard = ({ explanation }: SiraAnalysisCardProps) => (
  <aside
    aria-labelledby="sira-analysis-heading"
    className="relative bg-accent-light dark:bg-accent/10 border-l-4 border-accent rounded-r-xl px-5 py-4 sm:px-6 sm:py-5"
  >
    <div className="flex items-center gap-2 mb-2">
      <Sparkles className="w-4 h-4 text-accent-dark dark:text-accent" aria-hidden="true" />
      <h2
        id="sira-analysis-heading"
        className="text-xs font-bold uppercase tracking-wider text-accent-dark dark:text-accent"
      >
        Análise do SIRA+
      </h2>
    </div>
    <p className="text-[15px] text-text leading-relaxed">
      {explanation}
    </p>
  </aside>
);
