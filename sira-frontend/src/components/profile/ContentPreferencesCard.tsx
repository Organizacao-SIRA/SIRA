import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '../ui/Checkbox';
import { SectionCard } from './SectionCard';
import { preferenceValueLabel } from '../../i18n/preferenceLabels';

type BoolPreferenceField = 'wantsBooks' | 'wantsArticles' | 'wantsOpenAccessOnly';

interface ContentPreferencesCardProps {
  isEditing: boolean;
  data: {
    languages: string[];
    materialLevels: string[];
    wantsBooks: boolean;
    wantsArticles: boolean;
    wantsOpenAccessOnly: boolean;
  };
  editData: {
    languages: string[];
    materialLevels: string[];
    wantsBooks: boolean;
    wantsArticles: boolean;
    wantsOpenAccessOnly: boolean;
  };
  onArrayChange: (field: 'languages' | 'materialLevels', value: string, checked: boolean) => void;
  onBoolChange: (field: BoolPreferenceField, value: boolean) => void;
  languagesList: string[];
  materialLevelsList: string[];
}

const GroupTitle = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs font-bold text-text-subtle uppercase tracking-widest block mb-3">
    {children}
  </span>
);

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

  return (
    <SectionCard icon={Settings} title={t('sections.content')}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <GroupTitle>{t('fields.languages')}</GroupTitle>
          <div className="space-y-2">
            {languagesList.map(lang => (
              <Checkbox
                key={lang}
                label={preferenceValueLabel(lang, tp)}
                checked={source.languages?.includes(lang)}
                onChange={(e) => isEditing && onArrayChange('languages', lang, e.target.checked)}
                disabled={!isEditing}
              />
            ))}
          </div>
        </div>

        <div>
          <GroupTitle>{t('fields.level')}</GroupTitle>
          <div className="space-y-2">
            {materialLevelsList.map(level => (
              <Checkbox
                key={level}
                label={preferenceValueLabel(level, tp)}
                checked={source.materialLevels?.includes(level)}
                onChange={(e) => isEditing && onArrayChange('materialLevels', level, e.target.checked)}
                disabled={!isEditing}
              />
            ))}
          </div>
        </div>

        <div>
          <GroupTitle>{t('fields.formats')}</GroupTitle>
          <div className="space-y-2">
            <Checkbox
              label={t('content.books')}
              checked={source.wantsBooks}
              onChange={(e) => isEditing && onBoolChange('wantsBooks', e.target.checked)}
              disabled={!isEditing}
            />
            <Checkbox
              label={t('content.articles')}
              checked={source.wantsArticles}
              onChange={(e) => isEditing && onBoolChange('wantsArticles', e.target.checked)}
              disabled={!isEditing}
            />
          </div>

          <GroupTitle>{t('fields.access')}</GroupTitle>
          <div className="space-y-2">
            <Checkbox
              label={t('content.openAccessOnly')}
              checked={source.wantsOpenAccessOnly}
              onChange={(e) => isEditing && onBoolChange('wantsOpenAccessOnly', e.target.checked)}
              disabled={!isEditing}
            />
            {source.wantsOpenAccessOnly && (
              <p className="text-[11px] text-text-subtle leading-snug pl-5">
                {t('content.openAccessHint')}
              </p>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
};
