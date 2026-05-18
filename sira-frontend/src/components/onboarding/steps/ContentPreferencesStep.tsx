import { Settings, Languages, BarChart3, BookCopy } from 'lucide-react';
import { SelectableChip } from '../SelectableChip';
import { PreferenceGroup } from '../PreferenceGroup';
import type { OnboardingFormData, StepFieldErrors } from '../../../types/onboarding';
import type { PreferenceOptions } from '../../../types';

interface ContentPreferencesStepProps {
  data: OnboardingFormData;
  errors: StepFieldErrors;
  options: PreferenceOptions;
  onToggleArray: (field: 'languages' | 'materialLevels', value: string) => void;
  onChange: <K extends keyof OnboardingFormData>(field: K, value: OnboardingFormData[K]) => void;
}

export const ContentPreferencesStep = ({
  data,
  errors,
  options,
  onToggleArray,
  onChange,
}: ContentPreferencesStepProps) => (
  <div className="space-y-6 max-w-2xl mx-auto">
    <header className="flex items-start gap-3">
      <div className="p-2 bg-primary-soft rounded-lg text-primary">
        <Settings className="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-primary-dark dark:text-text">Preferências de conteúdo</h2>
        <p className="text-sm text-text-muted mt-0.5">
          Como você prefere consumir o material? Pode escolher mais de uma opção em cada grupo.
        </p>
      </div>
    </header>

    <PreferenceGroup
      title="Idiomas"
      description="Em quais idiomas você gostaria de receber recomendações?"
      icon={<Languages className="w-4 h-4" aria-hidden="true" />}
      error={errors.languages}
    >
      {options.languages.map((lang) => (
        <SelectableChip
          key={lang}
          label={lang}
          selected={data.languages.includes(lang)}
          onToggle={() => onToggleArray('languages', lang)}
        />
      ))}
    </PreferenceGroup>

    <PreferenceGroup
      title="Nível de profundidade"
      description="Qual nível de complexidade você costuma estudar?"
      icon={<BarChart3 className="w-4 h-4" aria-hidden="true" />}
      error={errors.materialLevels}
    >
      {options.materialLevels.map((level) => (
        <SelectableChip
          key={level}
          label={level}
          selected={data.materialLevels.includes(level)}
          onToggle={() => onToggleArray('materialLevels', level)}
        />
      ))}
    </PreferenceGroup>

    <PreferenceGroup
      title="Formatos de material"
      description="Selecione pelo menos um tipo de material."
      icon={<BookCopy className="w-4 h-4" aria-hidden="true" />}
      error={errors.wantsBooks}
    >
      <SelectableChip
        label="Livros"
        selected={data.wantsBooks}
        onToggle={() => onChange('wantsBooks', !data.wantsBooks)}
      />
      <SelectableChip
        label="Artigos científicos"
        selected={data.wantsArticles}
        onToggle={() => onChange('wantsArticles', !data.wantsArticles)}
      />
    </PreferenceGroup>
  </div>
);
