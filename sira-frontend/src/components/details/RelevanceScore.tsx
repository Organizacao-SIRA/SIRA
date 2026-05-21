interface RelevanceScoreProps {
  value: number;
  label?: string;
}

const getTone = (value: number) => {
  if (value >= 85) return 'bg-success';
  if (value >= 70) return 'bg-primary';
  return 'bg-warning-strong';
};

export const RelevanceScore = ({ value, label = 'Relevância Semântica' }: RelevanceScoreProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const tone = getTone(clamped);

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
        <span className="text-text-muted">{label}</span>
        <span className="text-text" aria-hidden="true">{clamped}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${clamped} por cento`}
        className="w-full bg-surface-subtle rounded-full h-2 overflow-hidden"
      >
        <div
          className={`${tone} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
