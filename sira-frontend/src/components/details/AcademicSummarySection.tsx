import { FileText } from 'lucide-react';

interface AcademicSummarySectionProps {
  abstract?: string;
  keywords?: string[];
}

export const AcademicSummarySection = ({ abstract, keywords }: AcademicSummarySectionProps) => {
  const hasAbstract = abstract && abstract.trim().length > 0;
  const hasKeywords = keywords && keywords.length > 0;

  if (!hasAbstract && !hasKeywords) return null;

  return (
    <section
      aria-labelledby="academic-summary-heading"
      className="bg-surface rounded-2xl border border-border shadow-sm p-5 sm:p-8"
    >
      <h2
        id="academic-summary-heading"
        className="text-lg sm:text-xl font-bold text-primary-dark dark:text-text mb-4 sm:mb-5 flex items-center gap-2"
      >
        <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
        Resumo Acadêmico
      </h2>

      {hasAbstract ? (
        <p className="text-text leading-relaxed text-justify text-base">
          {abstract}
        </p>
      ) : (
        <p className="text-sm text-text-subtle italic">
          Resumo não disponível para este material.
        </p>
      )}

      {hasKeywords && (
        <div className="mt-6 sm:mt-8 pt-5 border-t border-border">
          <h3 className="text-xs font-bold text-text-subtle uppercase tracking-widest mb-3">
            Palavras-chave
          </h3>
          <ul className="flex flex-wrap gap-2" aria-label="Palavras-chave do material">
            {keywords!.map((kw, idx) => (
              <li
                key={`${kw}-${idx}`}
                className="bg-info-soft text-info-strong px-3 py-1.5 rounded-lg text-sm font-medium border border-info-border"
              >
                {kw}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
