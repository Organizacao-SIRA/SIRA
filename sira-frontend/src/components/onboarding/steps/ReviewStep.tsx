import { Pencil, AlertCircle, ClipboardCheck } from 'lucide-react';
import type { OnboardingFormData } from '../../../types/onboarding';
import type { PreferenceOptions } from '../../../types';

interface ReviewStepProps {
  data: OnboardingFormData;
  options: PreferenceOptions;
  onEdit: (step: number) => void;
  submitError?: string;
}

const Section = ({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) => (
  <div className="bg-surface-muted border border-border rounded-xl p-4">
    <div className="flex items-start justify-between gap-3 mb-2">
      <h3 className="text-[10px] font-bold text-text-subtle uppercase tracking-widest">{title}</h3>
      <button
        type="button"
        onClick={onEdit}
        className="text-xs font-bold text-primary hover:text-primary-dark inline-flex items-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-md px-1.5 py-0.5"
      >
        <Pencil className="w-3 h-3" />
        Editar
      </button>
    </div>
    <div className="text-sm text-text">{children}</div>
  </div>
);

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface text-text text-xs font-semibold border border-border">
    {children}
  </span>
);

export const ReviewStep = ({ data, options, onEdit, submitError }: ReviewStepProps) => {
  const mainAreaLabel =
    options.topics.find((t) => t.id === data.mainArea)?.label || data.mainArea || '—';

  const interestLabels = data.interests
    .map((id) => options.topics.find((t) => t.id === id)?.label || id);

  const formats: string[] = [];
  if (data.wantsBooks) formats.push('Livros');
  if (data.wantsArticles) formats.push('Artigos científicos');

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <header className="flex items-start gap-3">
        <div className="p-2 bg-primary-soft rounded-lg text-primary">
          <ClipboardCheck className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-primary-dark dark:text-text">Revise suas escolhas</h2>
          <p className="text-sm text-text-muted mt-0.5">
            Confira tudo abaixo. Se algo não estiver certo, é só clicar em <span className="font-bold">Editar</span>.
          </p>
        </div>
      </header>

      <div className="space-y-3">
        <Section title="Perfil acadêmico" onEdit={() => onEdit(1)}>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            <div>
              <dt className="text-xs text-text-muted">Curso</dt>
              <dd className="font-semibold">{data.course || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Nível</dt>
              <dd className="font-semibold">{data.educationLevel}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Área principal</dt>
              <dd className="font-semibold">{mainAreaLabel}</dd>
            </div>
            {data.subAreas && (
              <div>
                <dt className="text-xs text-text-muted">Subáreas</dt>
                <dd className="font-semibold">{data.subAreas}</dd>
              </div>
            )}
          </dl>
        </Section>

        <Section title="Áreas de interesse" onEdit={() => onEdit(2)}>
          <div className="flex flex-wrap gap-1.5">
            {interestLabels.length === 0
              ? <span className="text-text-muted">Nenhuma selecionada</span>
              : interestLabels.map((label) => <Chip key={label}>{label}</Chip>)}
          </div>
        </Section>

        <Section title="Preferências de conteúdo" onEdit={() => onEdit(3)}>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-text-muted block mb-1">Idiomas</span>
              <div className="flex flex-wrap gap-1.5">
                {data.languages.map((l) => <Chip key={l}>{l}</Chip>)}
              </div>
            </div>
            <div>
              <span className="text-xs text-text-muted block mb-1">Nível</span>
              <div className="flex flex-wrap gap-1.5">
                {data.materialLevels.map((l) => <Chip key={l}>{l}</Chip>)}
              </div>
            </div>
            <div>
              <span className="text-xs text-text-muted block mb-1">Formatos</span>
              <div className="flex flex-wrap gap-1.5">
                {formats.map((f) => <Chip key={f}>{f}</Chip>)}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Objetivo acadêmico" onEdit={() => onEdit(4)}>
          {data.academicGoal
            ? <span className="font-semibold">{data.academicGoal}</span>
            : <span className="text-text-muted">Não informado</span>}
        </Section>
      </div>

      {submitError && (
        <div className="p-3 bg-danger-soft border border-danger-border rounded-xl flex items-start gap-2" role="alert">
          <AlertCircle className="w-4 h-4 text-danger-strong mt-0.5 flex-shrink-0" />
          <p className="text-danger-strong text-xs font-medium">{submitError}</p>
        </div>
      )}
    </div>
  );
};
