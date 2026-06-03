import { Settings, Languages, BarChart3, BookCopy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SelectableChip } from '../SelectableChip';
import { PreferenceGroup } from '../PreferenceGroup';
import { preferenceValueLabel } from '../../../i18n/preferenceLabels';
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
}: ContentPreferencesStepProps) => {
  const { t } = useTranslation('onboarding');
  const { t: tp } = useTranslation('preferences');

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
    <header className="flex items-start gap-3">
      <div className="p-2 bg-primary-soft rounded-lg text-link">
        <Settings className="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-primary-dark dark:text-text">{t('preferences.title')}</h2>
        <p className="text-sm text-text-muted mt-0.5">
          {t('preferences.description')}
        </p>
      </div>
    </header>

    <PreferenceGroup
      title={t('preferences.languagesTitle')}
      description={t('preferences.languagesDescription')}
      icon={<Languages className="w-4 h-4" aria-hidden="true" />}
      error={errors.languages}
    >
      {options.languages.map((lang) => (
        <SelectableChip
          key={lang}
          label={preferenceValueLabel(lang, tp)}
          selected={data.languages.includes(lang)}
          onToggle={() => onToggleArray('languages', lang)}
        />
      ))}
    </PreferenceGroup>

    <PreferenceGroup
      title={t('preferences.depthTitle')}
      description={t('preferences.depthDescription')}
      icon={<BarChart3 className="w-4 h-4" aria-hidden="true" />}
      error={errors.materialLevels}
    >
      {options.materialLevels.map((level) => (
        <SelectableChip
          key={level}
          label={preferenceValueLabel(level, tp)}
          selected={data.materialLevels.includes(level)}
          onToggle={() => onToggleArray('materialLevels', level)}
        />
      ))}
    </PreferenceGroup>

    <PreferenceGroup
      title={t('preferences.formatsTitle')}
      description={t('preferences.formatsDescription')}
      icon={<BookCopy className="w-4 h-4" aria-hidden="true" />}
      error={errors.wantsBooks}
    >
      <SelectableChip
        label={t('preferences.books')}
        selected={data.wantsBooks}
        onToggle={() => onChange('wantsBooks', !data.wantsBooks)}
      />
      <SelectableChip
        label={t('preferences.articles')}
        selected={data.wantsArticles}
        onToggle={() => onChange('wantsArticles', !data.wantsArticles)}
      />
    </PreferenceGroup>
    </div>
  );
};
