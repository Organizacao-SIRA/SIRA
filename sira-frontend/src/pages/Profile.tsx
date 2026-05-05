import React, { useState, useEffect } from 'react';
import {
  Pencil, GraduationCap, Settings, School, CheckCircle2,
  Cpu, Landmark, Scale, LineChart, Activity, TrendingUp, Users, Globe, User as UserIcon
} from 'lucide-react';
import { updateProfile } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';

const AVAILABLE_THEMES = [
  { id: 'dir', label: 'Direito', icon: Scale },
  { id: 'ia', label: 'Tecnologia', icon: Cpu },
  { id: 'sau', label: 'Saúde', icon: Activity },
  { id: 'eco', label: 'Economia', icon: TrendingUp },
  { id: 'amb', label: 'Bioética', icon: Globe },
  { id: 'gp', label: 'Gestão Pública', icon: Landmark },
  { id: 'cd', label: 'Ciência de Dados', icon: LineChart },
  { id: 'edu', label: 'Educação', icon: GraduationCap },
  { id: 'soc', label: 'Sociologia', icon: Users },
];

interface ProfileProps {
  profileData: any;
  setProfileData: (data: any) => void;
}

export const Profile = ({ profileData, setProfileData }: ProfileProps) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState(profileData || {});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profileData) setEditProfileData(profileData);
  }, [profileData]);

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
    } catch {
      setProfileData(editProfileData);
    } finally {
      setIsSaving(false);
      setIsEditingProfile(false);
    }
  };

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
        {/* Cabeçalho de Identificação */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-100 overflow-hidden text-primary">
            <svg viewBox="0 0 100 100" className="w-16 h-16 mt-4">
              <circle cx="50" cy="35" r="25" fill="currentColor" opacity="0.8" />
              <path d="M10 100 Q50 50 90 100" fill="currentColor" opacity="0.8" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary-dark">{profileData.name}</h2>
            <p className="text-gray-500 text-sm">{profileData.email}</p>
          </div>
        </div>

        {/* GRID DE DUAS COLUNAS: Dados Pessoais e Perfil Acadêmico lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Seção Dados Pessoais */}
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

          {/* Seção Perfil Acadêmico */}
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
                    options={[
                      { value: 'Graduação', label: 'Graduação' },
                      { value: 'Mestrado', label: 'Mestrado' },
                      { value: 'Doutorado', label: 'Doutorado' },
                      { value: 'Especialização', label: 'Especialização' }
                    ]}
                  /> :
                  <span className="text-gray-900 font-bold">{profileData.educationLevel}</span>
                }
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center text-sm min-h-[44px]">
                <span className="text-gray-500">Área</span>
                {isEditingProfile ?
                  <Input value={editProfileData.mainArea} onChange={(e) => handleChange('mainArea', e.target.value)} /> :
                  <span className="text-gray-900 font-bold">{profileData.mainArea}</span>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Áreas de Interesse */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2 text-primary-dark">
            <School className="w-5 h-5" />
            <h3 className="font-bold">Áreas de Interesse</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {AVAILABLE_THEMES.map((theme) => {
                const Icon = theme.icon;
                const isSelected = isEditingProfile
                  ? editProfileData.interests?.includes(theme.id)
                  : profileData.interests?.includes(theme.id);

                return (
                  <button
                    key={theme.id}
                    onClick={() => toggleInterest(theme.id)}
                    disabled={!isEditingProfile}
                    className={`relative p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                      isSelected
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-50 bg-gray-50/50'
                    } ${isEditingProfile ? 'cursor-pointer hover:border-blue-200 shadow-sm' : 'cursor-default'}`}
                  >
                    {isSelected && isEditingProfile && (
                      <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />
                    )}
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary' : 'text-gray-300'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-primary-dark' : 'text-gray-500'}`}>
                      {theme.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Preferências de Conteúdo */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2 text-primary-dark">
            <Settings className="w-5 h-5" />
            <h3 className="font-bold">Preferências de Conteúdo</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Línguas</span>
              <div className="space-y-2">
                {['Português', 'Inglês', 'Espanhol'].map(lang => (
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
                {['Introdutório', 'Intermediário', 'Avançado'].map(level => (
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

        {/* Botões de Ação ao Editar */}
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
