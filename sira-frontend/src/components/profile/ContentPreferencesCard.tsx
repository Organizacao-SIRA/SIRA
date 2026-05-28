import { Settings } from 'lucide-react';
import { Checkbox } from '../ui/Checkbox';
import { SectionCard } from './SectionCard';

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
  const source = isEditing ? editData : data;

  return (
    <SectionCard icon={Settings} title="Preferências de Conteúdo">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <GroupTitle>Idiomas</GroupTitle>
          <div className="space-y-2">
            {languagesList.map(lang => (
              <Checkbox
                key={lang}
                label={lang}
                checked={source.languages?.includes(lang)}
                onChange={(e) => isEditing && onArrayChange('languages', lang, e.target.checked)}
                disabled={!isEditing}
              />
            ))}
          </div>
        </div>

        <div>
          <GroupTitle>Nível</GroupTitle>
          <div className="space-y-2">
            {materialLevelsList.map(level => (
              <Checkbox
                key={level}
                label={level}
                checked={source.materialLevels?.includes(level)}
                onChange={(e) => isEditing && onArrayChange('materialLevels', level, e.target.checked)}
                disabled={!isEditing}
              />
            ))}
          </div>
        </div>

        <div>
          <GroupTitle>Formatos</GroupTitle>
          <div className="space-y-2">
            <Checkbox
              label="Livros"
              checked={source.wantsBooks}
              onChange={(e) => isEditing && onBoolChange('wantsBooks', e.target.checked)}
              disabled={!isEditing}
            />
            <Checkbox
              label="Artigos"
              checked={source.wantsArticles}
              onChange={(e) => isEditing && onBoolChange('wantsArticles', e.target.checked)}
              disabled={!isEditing}
            />
          </div>

          <GroupTitle>Acesso</GroupTitle>
          <div className="space-y-2">
            <Checkbox
              label="Apenas acesso aberto"
              checked={source.wantsOpenAccessOnly}
              onChange={(e) => isEditing && onBoolChange('wantsOpenAccessOnly', e.target.checked)}
              disabled={!isEditing}
            />
            {source.wantsOpenAccessOnly && (
              <p className="text-[11px] text-text-subtle leading-snug pl-5">
                Recomendações incluirão apenas materiais gratuitos.
              </p>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
};
