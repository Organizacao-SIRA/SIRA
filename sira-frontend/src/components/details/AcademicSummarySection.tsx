interface AcademicSummarySectionProps {
  abstract?: string;
  keywords?: string[];
}

export const AcademicSummarySection = ({ abstract, keywords }: AcademicSummarySectionProps) => {
  const hasAbstract = abstract && abstract.trim().length > 0;
  const hasKeywords = keywords && keywords.length > 0;

  if (!hasAbstract && !hasKeywords) return null;

  return (
    <section aria-labelledby="academic-summary-heading" className="space-y-8">
      <div className="space-y-3">
        <h2
          id="academic-summary-heading"
          className="text-xs font-bold uppercase tracking-widest text-text-subtle"
        >
          Resumo
        </h2>
        {hasAbstract ? (
          <p className="text-text leading-[1.75] text-[17px] text-justify">
            {abstract}
          </p>
        ) : (
          <p className="text-sm text-text-subtle italic">
            Resumo não disponível para este material.
          </p>
        )}
      </div>

      {hasKeywords && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-subtle">
            Palavras-chave
          </h3>
          <ul className="flex flex-wrap gap-2" aria-label="Palavras-chave do material">
            {keywords!.map((kw, idx) => (
              <li
                key={`${kw}-${idx}`}
                className="bg-surface-subtle text-text-muted px-3 py-1 rounded-full text-sm font-medium border border-border"
              >
                #{kw}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
