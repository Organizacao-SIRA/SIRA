import React, { useState, useEffect } from 'react';
import { 
  Pencil, GraduationCap, Settings, School, CheckCircle2,
  Cpu, Landmark, Scale, LineChart, Activity, TrendingUp, Users, Globe, User as UserIcon
} from 'lucide-react';

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

  useEffect(() => {
    if (profileData) setEditProfileData(profileData);
  }, [profileData]);

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

  const handleSave = () => {
    setProfileData(editProfileData);
    setIsEditingProfile(false);
  };

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
          <div>
            <h2 className="text-2xl font-bold text-[#003157]">{profileData.name}</h2>
            <p className="text-gray-500 text-sm">{profileData.email}</p>
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
                    <option>Graduação</option><option>Mestrado</option><option>Doutorado</option><option>Especialização</option>
                  </select> : 
                  <span className="text-gray-900 font-bold">{profileData.educationLevel}</span>
                }
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center text-sm">
                <span className="text-gray-500">Área</span>
                {isEditingProfile ? 
                  <input type="text" value={editProfileData.mainArea} onChange={(e) => handleChange('mainArea', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 outline-none" /> : 
                  <span className="text-gray-900 font-bold">{profileData.mainArea}</span>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Áreas de Interesse (Cards abaixo das colunas) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2 text-[#003157]">
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
                        ? 'border-[#1351B4] bg-blue-50' 
                        : 'border-gray-50 bg-gray-50/50'
                    } ${isEditingProfile ? 'cursor-pointer hover:border-blue-200 shadow-sm' : 'cursor-default'}`}
                  >
                    {isSelected && isEditingProfile && (
                      <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-[#1351B4]" />
                    )}
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-[#1351B4]' : 'text-gray-300'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#003157]' : 'text-gray-500'}`}>
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
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2 text-[#003157]">
            <Settings className="w-5 h-5" />
            <h3 className="font-bold">Preferências de Conteúdo</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Línguas</span>
              {['Português', 'Inglês', 'Espanhol'].map(lang => (
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
              {['Introdutório', 'Intermediário', 'Avançado'].map(level => (
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