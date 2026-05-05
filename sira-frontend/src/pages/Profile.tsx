import React, { useState, useEffect } from 'react';
import {
  Pencil, GraduationCap, Settings, School, CheckCircle2, Target,
  Cpu, Landmark, Scale, LineChart, Activity, TrendingUp, Users, Globe, User as UserIcon,
  ShieldCheck, AlertTriangle
} from 'lucide-react';
import { updateProfile, getPreferenceOptions } from '../services/api';
import type { PreferenceTopic, PreferenceOptions } from '../types';
import { useAuth } from '../contexts/AuthContext';

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

  if (!profileData) return <div className="p-20 text-center font-bold text-[#003157]">Carregando perfil...</div>;

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
    try {
      const saved = await updateProfile(editProfileData);
      setProfileData({ ...editProfileData, ...saved });
      updateUser({ name: saved.name });
    } catch {
      setProfileData(editProfileData);
    }
    setIsEditingProfile(false);
  };

  // Tópicos: usar opções do backend se disponíveis, senão fallback local
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

  // Resolver label do objetivo acadêmico
  const academicGoalLabel = profileData.academicGoal || 'Não informado';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[calc(100vh-68px)] animate-fadeIn">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#003157]">Meu Perfil</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie suas informações e preferências.</p>
        </div>
        {!isEditingProfile && (
          <button
            onClick={() => setIsEditingProfile(true)}
            className="bg-[#1351B4] hover:bg-[#003157] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" /> Editar Perfil
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Cabeçalho de Identificação */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-100 overflow-hidden text-[#1351B4]">
            <svg viewBox="0 0 100 100" className="w-16 h-16 mt-4">
              <circle cx="50" cy="35" r="25" fill="currentColor" opacity="0.8" />
              <path d="M10 100 Q50 50 90 100" fill="currentColor" opacity="0.8" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#003157]">{profileData.name}</h2>
            <p className="text-gray-500 text-sm">{profileData.email}</p>
          </div>
          {/* Badge de status do onboarding */}
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

        {/* GRID DE DUAS COLUNAS: Dados Pessoais e Perfil Acadêmico lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Seção Dados Pessoais */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-[#003157]">
              <UserIcon className="w-5 h-5" />
              <h3 className="font-bold">Dados Pessoais</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-[120px_1fr] items-center text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-500">Nome</span>
                {isEditingProfile ?
                  <input type="text" value={editProfileData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 outline-none focus:border-[#1351B4]" /> :
                  <span className="text-gray-900 font-bold">{profileData.name}</span>
                }
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center text-sm">
                <span className="text-gray-500">E-mail</span>
                {isEditingProfile ?
                  <input type="email" value={editProfileData.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 outline-none focus:border-[#1351B4]" /> :
                  <span className="text-gray-900">{profileData.email}</span>
                }
              </div>
            </div>
          </div>

          {/* Seção Perfil Acadêmico */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-[#003157]">
              <GraduationCap className="w-5 h-5" />
              <h3 className="font-bold">Perfil Acadêmico</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-[120px_1fr] items-center text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-500">Curso</span>
                {isEditingProfile ?
                  <input type="text" value={editProfileData.course} onChange={(e) => handleChange('course', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 outline-none" /> :
                  <span className="text-gray-900 font-bold">{profileData.course}</span>
                }
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-500">Nível</span>
                {isEditingProfile ?
                  <select value={editProfileData.educationLevel} onChange={(e) => handleChange('educationLevel', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 bg-white outline-none">
                    {educationLevelsList.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select> :
                  <span className="text-gray-900 font-bold">{profileData.educationLevel}</span>
                }
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-500">Área</span>
                {isEditingProfile ? (
                  <select
                    value={editProfileData.mainArea}
                    onChange={(e) => handleChange('mainArea', e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1 bg-white outline-none"
                  >
                    <option value="">Selecione a área principal</option>
                    {topicsList.map((topic) => (
                      <option key={topic.id} value={topic.id}>{topic.label}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-900 font-bold">
                    {topicsList.find(t => t.id === profileData.mainArea)?.label || profileData.mainArea}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center text-sm">
                <span className="text-gray-500">Objetivo</span>
                {isEditingProfile ?
                  <select value={editProfileData.academicGoal || ''} onChange={(e) => handleChange('academicGoal', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 bg-white outline-none">
                    <option value="">Não informado</option>
                    {academicGoalsList.map(goal => (
                      <option key={goal} value={goal}>{goal}</option>
                    ))}
                  </select> :
                  <span className="text-gray-900 font-bold flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-gray-400" />
                    {academicGoalLabel}
                  </span>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Áreas de Interesse */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2 text-[#003157]">
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
                        ? 'border-[#1351B4] bg-blue-50'
                        : 'border-gray-50 bg-gray-50/50'
                    } ${isEditingProfile ? 'cursor-pointer hover:border-blue-200 shadow-sm' : 'cursor-default'}`}
                    title={topic.description}
                  >
                    {isSelected && isEditingProfile && (
                      <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-[#1351B4]" />
                    )}
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-[#1351B4]' : 'text-gray-300'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#003157]' : 'text-gray-500'}`}>
                      {topic.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Preferências de Conteúdo */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2 text-[#003157]">
            <Settings className="w-5 h-5" />
            <h3 className="font-bold">Preferências de Conteúdo</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Línguas</span>
              {languagesList.map(lang => (
                <label key={lang} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEditingProfile ? (editProfileData.languages?.includes(lang)) : (profileData.languages?.includes(lang))}
                    onChange={(e) => isEditingProfile && handleCheckboxArrayChange('languages', lang, e.target.checked)}
                    disabled={!isEditingProfile}
                    className="rounded text-[#1351B4] w-4 h-4"
                  />
                  <span className="text-gray-700">{lang}</span>
                </label>
              ))}
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Nível</span>
              {materialLevelsList.map(level => (
                <label key={level} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEditingProfile ? (editProfileData.materialLevels?.includes(level)) : (profileData.materialLevels?.includes(level))}
                    onChange={(e) => isEditingProfile && handleCheckboxArrayChange('materialLevels', level, e.target.checked)}
                    disabled={!isEditingProfile}
                    className="rounded text-[#1351B4] w-4 h-4"
                  />
                  <span className="text-gray-700">{level}</span>
                </label>
              ))}
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Formatos</span>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isEditingProfile ? editProfileData.wantsBooks : profileData.wantsBooks} onChange={(e) => isEditingProfile && handleChange('wantsBooks', e.target.checked)} disabled={!isEditingProfile} className="rounded text-[#1351B4] w-4 h-4" />
                <span className="text-gray-700">Livros</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isEditingProfile ? editProfileData.wantsArticles : profileData.wantsArticles} onChange={(e) => isEditingProfile && handleChange('wantsArticles', e.target.checked)} disabled={!isEditingProfile} className="rounded text-[#1351B4] w-4 h-4" />
                <span className="text-gray-700">Artigos</span>
              </label>
            </div>
          </div>
        </div>

        {/* Botões de Ação ao Editar */}
        {isEditingProfile && (
          <div className="flex justify-end gap-3 pt-2 pb-8">
            <button onClick={() => setIsEditingProfile(false)} className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-all cursor-pointer">Cancelar</button>
            <button onClick={handleSave} className="bg-[#1351B4] text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-[#003157] transition-all cursor-pointer">Salvar Alterações</button>
          </div>
        )}
      </div>
    </div>
  );
};
