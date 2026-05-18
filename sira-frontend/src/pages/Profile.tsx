import React, { useState, useEffect } from 'react';
import {
  Pencil, GraduationCap, Settings, School, CheckCircle2, Target,
  Cpu, Landmark, Scale, LineChart, Activity, TrendingUp, Users, Globe, User as UserIcon,
  ShieldCheck, AlertTriangle
} from 'lucide-react';
import { updateProfile, getPreferenceOptions } from '../services/api';
import type { PreferenceTopic, PreferenceOptions } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { UserAvatar } from '../components/ui/UserAvatar';
import { StatusBadge } from '../components/ui/StatusBadge';

const TOPIC_ICONS: Record<string, React.ElementType> = {
  ia: Cpu,
  gp: Landmark,
  dir: Scale,
  cd: LineChart,
  edu: GraduationCap,
  sau: Activity,
  eco: TrendingUp,
  soc: Users,
  amb: Globe,
};

interface ProfileProps {
  profileData: any;
  setProfileData: (data: any) => void;
}

export const Profile = ({ profileData, setProfileData }: ProfileProps) => {
  const { updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState(profileData || {});
  const [preferenceOptions, setPreferenceOptions] = useState<PreferenceOptions | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (profileData) setEditProfileData(profileData);
  }, [profileData]);

  useEffect(() => {
    if (isEditingProfile && !preferenceOptions) {
      getPreferenceOptions()
        .then(setPreferenceOptions)
        .catch(() => {});
    }
  }, [isEditingProfile]);

  if (!profileData) return <div className="p-20 text-center font-bold text-primary-dark dark:text-text">Carregando perfil...</div>;

  const handleChange = (field: string, value: any) => {
    setEditProfileData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxArrayChange = (field: string, value: string, isChecked: boolean) => {
    const currentArray = editProfileData[field] || [];
    if (isChecked) {
      handleChange(field, [...currentArray, value]);
    } else {
      handleChange(field, currentArray.filter((item: string) => item !== value));
    }
  };

  const toggleInterest = (id: string) => {
    if (!isEditingProfile) return;
    const currentInterests = editProfileData.interests || [];
    if (currentInterests.includes(id)) {
      handleChange('interests', currentInterests.filter((item: string) => item !== id));
    } else {
      handleChange('interests', [...currentInterests, id]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const payload = {
        name: editProfileData.name,
        course: editProfileData.course,
        educationLevel: editProfileData.educationLevel,
        mainArea: editProfileData.mainArea,
        subAreas: editProfileData.subAreas,
        languages: editProfileData.languages,
        materialLevels: editProfileData.materialLevels,
        wantsBooks: editProfileData.wantsBooks,
        wantsArticles: editProfileData.wantsArticles,
        interests: editProfileData.interests,
        academicGoal: editProfileData.academicGoal,
      };
      const saved = await updateProfile(payload);
      setProfileData(prev => ({ ...prev, ...saved }));
      updateUser({ name: saved.name });
      setIsEditingProfile(false);
    } catch (err: any) {
      setSaveError(err.message || 'Erro ao salvar perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const topicsList: PreferenceTopic[] = preferenceOptions?.topics || [
    { id: 'dir', label: 'Direito' },
    { id: 'ia', label: 'Tecnologia' },
    { id: 'sau', label: 'Saúde' },
    { id: 'eco', label: 'Economia' },
    { id: 'amb', label: 'Meio Ambiente' },
    { id: 'gp', label: 'Gestão Pública' },
    { id: 'cd', label: 'Ciência de Dados' },
    { id: 'edu', label: 'Educação' },
    { id: 'soc', label: 'Sociologia' },
  ];

  const languagesList = preferenceOptions?.languages || ['Português', 'Inglês', 'Espanhol'];
  const materialLevelsList = preferenceOptions?.materialLevels || ['Introdutório', 'Intermediário', 'Avançado'];
  const educationLevelsList = preferenceOptions?.educationLevels || ['Graduação', 'Especialização', 'Mestrado', 'Doutorado'];
  const academicGoalsList = preferenceOptions?.academicGoals || [];

  const academicGoalLabel = profileData.academicGoal || 'Não informado';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[calc(100vh-68px)] animate-fadeIn">
      <div className="flex items-start justify-between mb-8">
        <PageHeader
          icon={Settings}
          title="Meu Perfil"
          subtitle="Gerencie suas informações e preferências."
        />
        {!isEditingProfile && (
          <Button onClick={() => setIsEditingProfile(true)} className="mt-1">
            <Pencil className="w-4 h-4" /> Editar Perfil
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center gap-5">
          <UserAvatar name={profileData.name} size="lg" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-primary-dark dark:text-text">{profileData.name}</h2>
            <p className="text-text-muted text-sm">{profileData.email}</p>
          </div>
          {profileData.hasCompletedOnboarding ? (
            <StatusBadge variant="success" icon={<ShieldCheck className="w-4 h-4" />} className="rounded-full px-4 py-2 text-xs">
              Preferências concluídas
            </StatusBadge>
          ) : (
            <StatusBadge variant="warning" icon={<AlertTriangle className="w-4 h-4" />} className="rounded-full px-4 py-2 text-xs">
              Preferências pendentes
            </StatusBadge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-border bg-surface-muted/30 flex items-center gap-2 text-primary-dark dark:text-text">
              <UserIcon className="w-5 h-5" />
              <h3 className="font-bold">Dados Pessoais</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-[120px_1fr] items-center text-sm border-b border-border pb-2 min-h-[44px]">
                <span className="text-text-muted">Nome</span>
                {isEditingProfile ?
                  <Input value={editProfileData.name} onChange={(e) => handleChange('name', e.target.value)} /> :
                  <span className="text-text font-bold">{profileData.name}</span>
                }
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center text-sm min-h-[44px]">
                <span className="text-text-muted">E-mail</span>
                <span className="text-text text-sm">{profileData.email}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-border bg-surface-muted/30 flex items-center gap-2 text-primary-dark dark:text-text">
              <GraduationCap className="w-5 h-5" />
              <h3 className="font-bold">Perfil Acadêmico</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-[120px_1fr] items-center text-sm border-b border-border pb-2 min-h-[44px]">
                <span className="text-text-muted">Curso</span>
                {isEditingProfile ?
                  <Input value={editProfileData.course} onChange={(e) => handleChange('course', e.target.value)} /> :
                  <span className="text-text font-bold">{profileData.course}</span>
                }
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center text-sm border-b border-border pb-2 min-h-[44px]">
                <span className="text-text-muted">Nível</span>
                {isEditingProfile ?
                  <Select
                    value={editProfileData.educationLevel}
                    onChange={(e) => handleChange('educationLevel', e.target.value)}
                    options={educationLevelsList.map(l => ({ value: l, label: l }))}
                  /> :
                  <span className="text-text font-bold">{profileData.educationLevel}</span>
                }
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center text-sm border-b border-border pb-2 min-h-[44px]">
                <span className="text-text-muted">Área</span>
                {isEditingProfile ? (
                  <Select
                    value={editProfileData.mainArea}
                    onChange={(e) => handleChange('mainArea', e.target.value)}
                    options={[
                      { value: '', label: 'Selecione a área' },
                      ...topicsList.map(t => ({ value: t.id, label: t.label }))
                    ]}
                  />
                ) : (
                  <span className="text-text font-bold">
                    {topicsList.find(t => t.id === profileData.mainArea)?.label || profileData.mainArea}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center text-sm min-h-[44px]">
                <span className="text-text-muted">Objetivo</span>
                {isEditingProfile ?
                  <Select
                    value={editProfileData.academicGoal || ''}
                    onChange={(e) => handleChange('academicGoal', e.target.value)}
                    options={[
                      { value: '', label: 'Não informado' },
                      ...academicGoalsList.map(g => ({ value: g, label: g }))
                    ]}
                  /> :
                  <span className="text-text font-bold flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-text-subtle" />
                    {academicGoalLabel}
                  </span>
                }
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface-muted/30 flex items-center gap-2.5">
            <div className="p-1.5 bg-primary rounded-md flex-shrink-0">
              <School className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-primary-dark dark:text-text">Áreas de Interesse</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {topicsList.map((topic) => {
                const Icon = TOPIC_ICONS[topic.id] || Globe;
                const isSelected = isEditingProfile
                  ? editProfileData.interests?.includes(topic.id)
                  : profileData.interests?.includes(topic.id);

                return (
                  <button
                    key={topic.id}
                    onClick={() => toggleInterest(topic.id)}
                    disabled={!isEditingProfile}
                    aria-pressed={isSelected}
                    className={`relative p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.97] ${
                      isSelected
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : 'border-border bg-surface-muted text-text-muted'
                    } ${isEditingProfile ? 'cursor-pointer hover:border-primary hover:bg-primary/10 shadow-sm' : 'cursor-default'}`}
                    title={topic.description}
                  >
                    {isSelected && (
                      <CheckCircle2 className={`absolute top-2 right-2 w-4 h-4 ${isEditingProfile ? 'text-white/80' : 'text-white/60'}`} />
                    )}
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-white' : 'text-text-subtle dark:text-text-muted'}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-text-muted'}`}>
                      {topic.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2 text-primary-dark dark:text-text">
            <Settings className="w-5 h-5" />
            <h3 className="font-bold">Preferências de Conteúdo</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-text-subtle uppercase tracking-widest block mb-1">Línguas</span>
              <div className="space-y-2">
                {languagesList.map(lang => (
                  <Checkbox
                    key={lang}
                    label={lang}
                    checked={isEditingProfile ? (editProfileData.languages?.includes(lang)) : (profileData.languages?.includes(lang))}
                    onChange={(e) => isEditingProfile && handleCheckboxArrayChange('languages', lang, e.target.checked)}
                    disabled={!isEditingProfile}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-text-subtle uppercase tracking-widest block mb-1">Nível</span>
              <div className="space-y-2">
                {materialLevelsList.map(level => (
                  <Checkbox
                    key={level}
                    label={level}
                    checked={isEditingProfile ? (editProfileData.materialLevels?.includes(level)) : (profileData.materialLevels?.includes(level))}
                    onChange={(e) => isEditingProfile && handleCheckboxArrayChange('materialLevels', level, e.target.checked)}
                    disabled={!isEditingProfile}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-text-subtle uppercase tracking-widest block mb-1">Formatos</span>
              <div className="space-y-2">
                <Checkbox
                  label="Livros"
                  checked={isEditingProfile ? editProfileData.wantsBooks : profileData.wantsBooks}
                  onChange={(e) => isEditingProfile && handleChange('wantsBooks', e.target.checked)}
                  disabled={!isEditingProfile}
                />
                <Checkbox
                  label="Artigos"
                  checked={isEditingProfile ? editProfileData.wantsArticles : profileData.wantsArticles}
                  onChange={(e) => isEditingProfile && handleChange('wantsArticles', e.target.checked)}
                  disabled={!isEditingProfile}
                />
              </div>
            </div>
          </div>
        </div>

        {isEditingProfile && (
          <div className="flex flex-col items-end gap-3 pt-2 pb-8">
            {saveError && (
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{saveError}</p>
            )}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => { setIsEditingProfile(false); setSaveError(''); }} disabled={isSaving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} isLoading={isSaving}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
