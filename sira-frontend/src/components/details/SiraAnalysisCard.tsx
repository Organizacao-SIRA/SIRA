import { Sparkles } from 'lucide-react';
import { RelevanceScore } from './RelevanceScore';

interface SiraAnalysisCardProps {
  explanation?: string | null;
  relevance: number;
}

const DEFAULT_EXPLANATION = 'Recomendado com base na aderência ao seu perfil acadêmico.';

export const SiraAnalysisCard = ({ explanation, relevance }: SiraAnalysisCardProps) => {
  const text = explanation && explanation.trim().length > 0 ? explanation : DEFAULT_EXPLANATION;

  return (
    <section
      aria-labelledby="sira-analysis-heading"
      className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-accent-light border-b border-accent/30">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-accent-dark">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
        </div>
        <h2
          id="sira-analysis-heading"
          className="font-bold text-accent-dark text-sm sm:text-base"
        >
          Análise do SIRA+
        </h2>
      </div>

      <div className="p-5 space-y-5">
        <p className="text-sm text-text leading-relaxed">
          {text}
        </p>
        <div className="pt-4 border-t border-border">
          <RelevanceScore value={relevance} />
        </div>
      </div>
    </section>
  );
};
