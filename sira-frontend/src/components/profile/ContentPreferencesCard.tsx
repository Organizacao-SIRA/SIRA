import { Settings, Languages, BarChart3, BookCopy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SelectableChip } from '../ui/SelectableChip';
import { PreferenceGroup } from '../ui/PreferenceGroup';
import { SectionCard } from './SectionCard';
import { preferenceValueLabel } from '../../i18n/preferenceLabels';

type BoolPreferenceField = 'wantsBooks' | 'wantsArticles';

interface ContentPreferencesCardProps {
  isEditing: boolean;
  data: {
    languages: string[];
    materialLevels: string[];
    wantsBooks: boolean;
    wantsArticles: boolean;
  };
  editData: {
    languages: string[];
    materialLevels: string[];
    wantsBooks: boolean;
    wantsArticles: boolean;
  };
  onArrayChange: (field: 'languages' | 'materialLevels', value: string, checked: boolean) => void;
  onBoolChange: (field: BoolPreferenceField, value: boolean) => void;
  languagesList: string[];
  materialLevelsList: string[];
}

export const ContentPreferencesCard = ({
  isEditing,
  data,
  editData,
  onArrayChange,
  onBoolChange,
  languagesList,
  materialLevelsList,
}: ContentPreferencesCardProps) => {
  const { t } = useTranslation('profile');
  const { t: tp } = useTranslation('preferences');
  const source = isEditing ? editData : data;
  const readOnly = !isEditing;

  return (
    <SectionCard icon={Settings} title={t('sections.content')}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
        <PreferenceGroup
          title={t('fields.languages')}
          description={t('content.languagesHint')}
          icon={<Languages className="w-4 h-4" aria-hidden="true" />}
        >
          {languagesList.map((lang) => {
            const selected = source.languages?.includes(lang) ?? false;
            return (
              <SelectableChip
                key={lang}
                label={preferenceValueLabel(lang, tp)}
                selected={selected}
                onToggle={() => onArrayChange('languages', lang, !selected)}
                disabled={readOnly}
              />
            );
          })}
        </PreferenceGroup>

        <PreferenceGroup
          title={t('fields.materialLevel')}
          description={t('content.materialLevelHint')}
          icon={<BarChart3 className="w-4 h-4" aria-hidden="true" />}
        >
          {materialLevelsList.map((level) => {
            const selected = source.materialLevels?.includes(level) ?? false;
            return (
              <SelectableChip
                key={level}
                label={preferenceValueLabel(level, tp)}
                selected={selected}
                onToggle={() => onArrayChange('materialLevels', level, !selected)}
                disabled={readOnly}
              />
            );
          })}
        </PreferenceGroup>

        <PreferenceGroup
          title={t('fields.formats')}
          description={t('content.formatsHint')}
          icon={<BookCopy className="w-4 h-4" aria-hidden="true" />}
        >
          <SelectableChip
            label={t('content.books')}
            selected={source.wantsBooks}
            onToggle={() => onBoolChange('wantsBooks', !source.wantsBooks)}
            disabled={readOnly}
          />
          <SelectableChip
            label={t('content.articles')}
            selected={source.wantsArticles}
            onToggle={() => onBoolChange('wantsArticles', !source.wantsArticles)}
            disabled={readOnly}
          />
        </PreferenceGroup>
      </div>
    </SectionCard>
  );
};
