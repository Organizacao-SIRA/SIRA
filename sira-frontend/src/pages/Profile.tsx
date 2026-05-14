import React, { useState, useEffect } from 'react';
import {
  Pencil, GraduationCap, Settings, School, CheckCircle2, Target,
  Cpu, Landmark, Scale, LineChart, Activity, TrendingUp, Users, Globe, User as UserIcon,
  ShieldCheck, AlertTriangle, Loader2
} from 'lucide-react';
import { updateProfile, getPreferenceOptions } from '../services/api';
import type { PreferenceTopic, PreferenceOptions } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { UserAvatar } from '../components/ui/UserAvatar';

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

  useEffect(() => {
    if (profileData) setEditProfileData(profileData);
  }, [profileData]);

  // Carregamento dinâmico de opções (develop): essencial para que o "Editar" tenha as mesmas opções do Onboarding
  useEffect(() => {
    if (isEditingProfile && !preferenceOptions) {
      getPreferenceOptions()
        .then(setPreferenceOptions)
        .catch(() => {});
    }
  }, [isEditingProfile]);

  if (!profileData) return <div className="p-20 text-center font-bold text-primary-dark">Carregando perfil...</div>;

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
    try {
      const saved = await updateProfile(editProfileData);
      setProfileData({ ...editProfileData, ...saved });
      updateUser({ name: saved.name });
    } catch {
      // Em caso de erro, optei por não resetar o formulário para o usuário não perder o que digitou
      console.error("Erro ao salvar perfil");
    } finally {
      setIsSaving(false);
      setIsEditingProfile(false);
    }
  };

  // Fallbacks estáticos (design-system) caso a API falhe ou demore
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
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">Meu Perfil</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie suas informações e preferências.</p>
        </div>
        {!isEditingProfile && (
          <Button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2">
            <Pencil className="w-4 h-4" /> Editar Perfil
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Identificação: Mantive variáveis semânticas para textos e cores */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
          <UserAvatar name={profileData.name} size="lg" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-primary-dark">{profileData.name}</h2>
            <p className="text-gray-500 text-sm">{profileData.email}</p>
          </div>
          {/* Badge de status (develop): essencial para o feedback do usuário */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border ${
            profileData.hasCompletedOnboarding
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {profileData.hasCompletedOnboarding ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                Preferências concluídas
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Preferências pendentes
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados Pessoais: Usei Input atômico para garantir foco e estilo consistentes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-primary-dark">
              <UserIcon className="w-5 h-5" />
              <h3 className="font-bold">Dados Pessoais</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-[120px_1fr] items-center text-sm border-b border-gray-50 pb-2 min-h-[44px]">
                <span className="text-gray-500">Nome</span>
                {isEditingProfile ?
                  <Input value={editProfileData.name} onChange={(e) => handleChange('name', e.target.value)} /> :
                  <span className="text-gray-900 font-bold">{profileData.name}</span>
                }
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center text-sm min-h-[44px]">
                <span className="text-gray-500">E-mail</span>
                {isEditingProfile ?
                  <Input type="email" value={editProfileData.email} onChange={(e) => handleChange('email', e.target.value)} /> :
                  <span className="text-gray-900">{profileData.email}</span>
                }
              </div>
            </div>
          </div>

          {/* Perfil Acadêmico: Combinei a lógica de Select dinâmico com o componente Select atômico */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-primary-dark">
              <GraduationCap className="w-5 h-5" />
              <h3 className="font-bold">Perfil Acadêmico</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-[120px_1fr] items-center text-sm border-b border-gray-50 pb-2 min-h-[44px]">
                <span className="text-gray-500">Curso</span>
                {isEditingProfile ?
                  <Input value={editProfileData.course} onChange={(e) => handleChange('course', e.target.value)} /> :
                  <span className="text-gray-900 font-bold">{profileData.course}</span>
                }
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center text-sm border-b border-gray-50 pb-2 min-h-[44px]">
                <span className="text-gray-500">Nível</span>
                {isEditingProfile ?
                  <Select 
                    value={editProfileData.educationLevel} 
                    onChange={(e) => handleChange('educationLevel', e.target.value)}
                    options={educationLevelsList.map(l => ({ value: l, label: l }))}
                  /> :
                  <span className="text-gray-900 font-bold">{profileData.educationLevel}</span>
                }
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center text-sm border-b border-gray-50 pb-2 min-h-[44px]">
                <span className="text-gray-500">Área</span>
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
                  <span className="text-gray-900 font-bold">
                    {topicsList.find(t => t.id === profileData.mainArea)?.label || profileData.mainArea}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center text-sm min-h-[44px]">
                <span className="text-gray-500">Objetivo</span>
                {isEditingProfile ?
                  <Select 
                    value={editProfileData.academicGoal || ''} 
                    onChange={(e) => handleChange('academicGoal', e.target.value)}
                    options={[
                      { value: '', label: 'Não informado' },
                      ...academicGoalsList.map(g => ({ value: g, label: g }))
                    ]}
                  /> :
                  <span className="text-gray-900 font-bold flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-gray-400" />
                    {academicGoalLabel}
                  </span>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Áreas de Interesse: Usei botões customizados com variáveis de cor primária */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2 text-primary-dark">
            <School className="w-5 h-5" />
            <h3 className="font-bold">Áreas de Interesse</h3>
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
                    className={`relative p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                      isSelected
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-50 bg-gray-50/50'
                    } ${isEditingProfile ? 'cursor-pointer hover:border-blue-200 shadow-sm' : 'cursor-default'}`}
                    title={topic.description}
                  >
                    {isSelected && isEditingProfile && (
                      <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />
                    )}
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary' : 'text-gray-300'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-primary-dark' : 'text-gray-500'}`}>
                      {topic.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Preferências de Conteúdo: Substituí checkboxes nativos pelo componente Checkbox atômico */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2 text-primary-dark">
            <Settings className="w-5 h-5" />
            <h3 className="font-bold">Preferências de Conteúdo</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Línguas</span>
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
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Nível</span>
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
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Formatos</span>
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

        {/* Botões de Ação: Usei Button com variant secondary e isLoading para feedback visual (design-system) */}
        {isEditingProfile && (
          <div className="flex justify-end gap-3 pt-2 pb-8">
            <Button variant="secondary" onClick={() => setIsEditingProfile(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              Salvar Alterações
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
