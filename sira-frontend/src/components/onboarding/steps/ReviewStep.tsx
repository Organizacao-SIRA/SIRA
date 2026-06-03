import { Pencil, ClipboardCheck } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { preferenceTopicLabel, preferenceValueLabel } from '../../../i18n/preferenceLabels';
import type { OnboardingFormData } from '../../../types/onboarding';
import type { PreferenceOptions, PreferenceTopic } from '../../../types';

interface ReviewStepProps {
  data: OnboardingFormData;
  options: PreferenceOptions;
  onEdit: (step: number) => void;
}

const Section = ({
  title,
  onEdit,
  children,
  editLabel,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
  editLabel: string;
}) => (
  <div className="bg-surface-muted border border-border rounded-xl p-4">
    <div className="flex items-start justify-between gap-3 mb-2">
      <h3 className="text-[10px] font-bold text-text-subtle uppercase tracking-widest">{title}</h3>
      <button
        type="button"
        onClick={onEdit}
        className="text-xs font-bold text-link hover:text-link-hover inline-flex items-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/30 rounded-md px-1.5 py-0.5"
      >
        <Pencil className="w-3 h-3" />
        {editLabel}
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

export const ReviewStep = ({ data, options, onEdit }: ReviewStepProps) => {
  const { t } = useTranslation('onboarding');
  const { t: tp } = useTranslation('preferences');
  const mainAreaLabel =
    options.topics.find((topic) => topic.id === data.mainArea)
      ? preferenceTopicLabel(options.topics.find((topic) => topic.id === data.mainArea) as PreferenceTopic, tp)
      : data.mainArea || '—';

  const interestLabels = data.interests
    .map((id) => {
      const topic = options.topics.find((item) => item.id === id);
      return topic ? preferenceTopicLabel(topic, tp) : id;
    });

  const formats: string[] = [];
  if (data.wantsBooks) formats.push(t('preferences.books'));
  if (data.wantsArticles) formats.push(t('preferences.articles'));

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <header className="flex items-start gap-3">
        <div className="p-2 bg-primary-soft rounded-lg text-link">
          <ClipboardCheck className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-primary-dark dark:text-text">{t('review.title')}</h2>
          <p className="text-sm text-text-muted mt-0.5">
            <Trans
              i18nKey="review.description"
              ns="onboarding"
              components={{ strong: <span className="font-bold" /> }}
            />
          </p>
        </div>
      </header>

      <div className="space-y-3">
        <Section title={t('review.academicProfile')} editLabel={t('review.edit')} onEdit={() => onEdit(1)}>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            <div>
              <dt className="text-xs text-text-muted">{t('review.course')}</dt>
              <dd className="font-semibold">{data.course || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">{t('review.level')}</dt>
              <dd className="font-semibold">{preferenceValueLabel(data.educationLevel, tp)}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">{t('review.mainArea')}</dt>
              <dd className="font-semibold">{mainAreaLabel}</dd>
            </div>
            {data.subAreas && (
              <div>
                <dt className="text-xs text-text-muted">{t('review.subAreas')}</dt>
                <dd className="font-semibold">{data.subAreas}</dd>
              </div>
            )}
          </dl>
        </Section>

        <Section title={t('review.interestAreas')} editLabel={t('review.edit')} onEdit={() => onEdit(2)}>
          <div className="flex flex-wrap gap-1.5">
            {interestLabels.length === 0
              ? <span className="text-text-muted">{t('review.noneSelected')}</span>
              : interestLabels.map((label) => <Chip key={label}>{label}</Chip>)}
          </div>
        </Section>

        <Section title={t('review.contentPreferences')} editLabel={t('review.edit')} onEdit={() => onEdit(3)}>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-text-muted block mb-1">{t('review.languages')}</span>
              <div className="flex flex-wrap gap-1.5">
                {data.languages.map((l) => <Chip key={l}>{preferenceValueLabel(l, tp)}</Chip>)}
              </div>
            </div>
            <div>
              <span className="text-xs text-text-muted block mb-1">{t('review.level')}</span>
              <div className="flex flex-wrap gap-1.5">
                {data.materialLevels.map((l) => <Chip key={l}>{preferenceValueLabel(l, tp)}</Chip>)}
              </div>
            </div>
            <div>
              <span className="text-xs text-text-muted block mb-1">{t('review.formats')}</span>
              <div className="flex flex-wrap gap-1.5">
                {formats.map((f) => <Chip key={f}>{f}</Chip>)}
              </div>
            </div>
          </div>
        </Section>

        <Section title={t('review.academicGoal')} editLabel={t('review.edit')} onEdit={() => onEdit(4)}>
          {data.academicGoal
            ? <span className="font-semibold">{preferenceValueLabel(data.academicGoal, tp)}</span>
            : <span className="text-text-muted">{t('review.notInformed')}</span>}
        </Section>
      </div>
    </div>
  );
};
