import { GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { preferenceTopicLabel, preferenceValueLabel } from '@/i18n/preferenceLabels';
import type { OnboardingFormData, StepFieldErrors } from '@/types/onboarding';
import type { PreferenceOptions } from '@/types';

interface AcademicProfileStepProps {
  data: OnboardingFormData;
  errors: StepFieldErrors;
  options: PreferenceOptions;
  onChange: <K extends keyof OnboardingFormData>(field: K, value: OnboardingFormData[K]) => void;
}

export const AcademicProfileStep = ({ data, errors, options, onChange }: AcademicProfileStepProps) => {
  const { t } = useTranslation('onboarding');
  const { t: tp } = useTranslation('preferences');

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
    <header className="flex items-start gap-3">
      <div className="p-2 bg-primary-soft rounded-lg text-link">
        <GraduationCap className="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-primary-dark dark:text-text">{t('academicProfile.title')}</h2>
        <p className="text-sm text-text-muted mt-0.5">
          {t('academicProfile.description')}
        </p>
      </div>
    </header>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input
        label={t('academicProfile.course')}
        type="text"
        placeholder={t('academicProfile.coursePlaceholder')}
        value={data.course}
        onChange={(e) => onChange('course', e.target.value)}
        error={errors.course}
        required
      />
      <Select
        label={t('academicProfile.educationLevel')}
        value={data.educationLevel}
        onChange={(e) => onChange('educationLevel', e.target.value)}
        options={options.educationLevels.map((level) => ({ value: level, label: preferenceValueLabel(level, tp) }))}
      />
      <Select
        label={t('academicProfile.mainArea')}
        value={data.mainArea}
        onChange={(e) => onChange('mainArea', e.target.value)}
        error={errors.mainArea}
        options={[
          { value: '', label: t('academicProfile.selectMainArea') },
          ...options.topics.map((topic) => ({ value: topic.id, label: preferenceTopicLabel(topic, tp) })),
        ]}
        required
      />
      <Input
        label={t('academicProfile.subAreas')}
        type="text"
        placeholder={t('academicProfile.subAreasPlaceholder')}
        value={data.subAreas}
        onChange={(e) => onChange('subAreas', e.target.value)}
      />
    </div>

    <Input
      label={t('academicProfile.currentWork')}
      type="text"
      placeholder={t('academicProfile.currentWorkPlaceholder')}
      value={data.currentWork}
      onChange={(e) => onChange('currentWork', e.target.value)}
    />
    </div>
  );
};
