import React, { useState, useEffect } from 'react';
import { 
  Pencil, GraduationCap, Settings, School 
} from 'lucide-react';

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

  const handleSave = () => {
    setProfileData(editProfileData);
    setIsEditingProfile(false);
  };

  return (
    /* Ajustado para max-w-7xl para seguir o padrão das outras telas */
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[calc(100vh-68px)] animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#003157]">Meu Perfil</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie suas informações acadêmicas e preferências de recomendação.</p>
      </div>
      
      <div className="space-y-4">
        {/* Cabeçalho / Resumo */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-100 overflow-hidden text-[#1351B4]">
              <svg viewBox="0 0 100 100" className="w-16 h-16 mt-4">
                <circle cx="50" cy="35" r="25" fill="currentColor" opacity="0.8" />
                <path d="M10 100 Q50 50 90 100" fill="currentColor" opacity="0.8" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#003157]">{profileData.name}</h2>
              <p className="text-gray-500 text-sm">{profileData.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-[#FFF4CC] text-[#8A6D00] text-xs font-bold rounded-full uppercase tracking-wider">
                {profileData.educationLevel}
              </span>
            </div>
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

        {/* Dados Pessoais */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
            <Pencil className="w-5 h-5 text-[#1351B4]" />
            <h3 className="text-lg font-bold text-[#003157]">Dados Pessoais</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-y-4 text-sm items-center">
              <span className="text-gray-500">Nome</span>
              {isEditingProfile ? 
                <input type="text" value={editProfileData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 max-w-md outline-none focus:border-[#1351B4]" /> : 
                <span className="text-gray-900 font-bold">{profileData.name}</span>
              }
              <span className="text-gray-500">E-mail</span>
              {isEditingProfile ? 
                <input type="email" value={editProfileData.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 max-w-md outline-none" /> : 
                <span className="text-gray-900">{profileData.email}</span>
              }
              <span className="text-gray-500">Curso</span>
              {isEditingProfile ? 
                <input type="text" value={editProfileData.course} onChange={(e) => handleChange('course', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 max-w-md outline-none" /> : 
                <span className="text-gray-900">{profileData.course}</span>
              }
              <span className="text-gray-500">Nível</span>
              {isEditingProfile ? 
                <select value={editProfileData.educationLevel} onChange={(e) => handleChange('educationLevel', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 max-w-md bg-white outline-none">
                  <option>Graduação</option><option>Mestrado</option><option>Doutorado</option>
                </select> : 
                <span className="text-gray-900 font-bold">{profileData.educationLevel}</span>
              }
            </div>
          </div>
        </div>

        {/* Perfil Acadêmico */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#1351B4]" />
            <h3 className="text-lg font-bold text-[#003157]">Perfil Acadêmico</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-y-4 text-sm items-center">
              <span className="text-gray-500">Área Principal</span>
              {isEditingProfile ? 
                <input type="text" value={editProfileData.mainArea} onChange={(e) => handleChange('mainArea', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 max-w-md outline-none" /> : 
                <span className="text-gray-900 font-bold">{profileData.mainArea}</span>
              }
              <span className="text-gray-500">Subáreas</span>
              {isEditingProfile ? 
                <input type="text" value={editProfileData.subAreas} onChange={(e) => handleChange('subAreas', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 max-w-md outline-none" /> : 
                <span className="text-[#1351B4] font-medium">{profileData.subAreas}</span>
              }
            </div>
          </div>
        </div>

        {/* Preferências */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#1351B4]" />
            <h3 className="text-lg font-bold text-[#003157]">Preferências</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
              {/* Línguas */}
              <div className="space-y-3">
                <span className="text-gray-500 font-bold block mb-1">Línguas:</span>
                {['Português', 'Inglês', 'Espanhol'].map(lang => (
                  <label key={lang} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isEditingProfile ? (editProfileData.languages?.includes(lang)) : (profileData.languages?.includes(lang))}
                      onChange={(e) => isEditingProfile && handleCheckboxArrayChange('languages', lang, e.target.checked)}
                      disabled={!isEditingProfile}
                      className="rounded text-[#1351B4] w-4 h-4 disabled:opacity-50" 
                    />
                    <span className="text-gray-700">{lang}</span>
                  </label>
                ))}
              </div>

              {/* Nível material */}
              <div className="space-y-3">
                <span className="text-gray-500 font-bold block mb-1">Nível:</span>
                {['Introdutório', 'Intermediário', 'Avançado'].map(level => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isEditingProfile ? (editProfileData.materialLevels?.includes(level)) : (profileData.materialLevels?.includes(level))}
                      onChange={(e) => isEditingProfile && handleCheckboxArrayChange('materialLevels', level, e.target.checked)}
                      disabled={!isEditingProfile}
                      className="rounded text-[#1351B4] w-4 h-4 disabled:opacity-50" 
                    />
                    <span className="text-gray-700">{level}</span>
                  </label>
                ))}
              </div>

              {/* Tipos */}
              <div className="space-y-3">
                <span className="text-gray-500 font-bold block mb-1">Conteúdo:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isEditingProfile ? editProfileData.wantsBooks : profileData.wantsBooks} onChange={(e) => isEditingProfile && handleChange('wantsBooks', e.target.checked)} disabled={!isEditingProfile} className="rounded text-[#1351B4] w-4 h-4" />
                  <span className="text-gray-700">Livros</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isEditingProfile ? editProfileData.wantsArticles : profileData.wantsArticles} onChange={(e) => isEditingProfile && handleChange('wantsArticles', e.target.checked)} disabled={!isEditingProfile} className="rounded text-[#1351B4] w-4 h-4" />
                  <span className="text-gray-700">Artigos</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Botões Salvar */}
        {isEditingProfile && (
          <div className="flex justify-end gap-3 pt-4 pb-8">
            <button onClick={() => setIsEditingProfile(false)} className="px-6 py-2 rounded-full border text-gray-600 font-bold hover:bg-gray-50 transition-all">Cancelar</button>
            <button onClick={handleSave} className="bg-[#1351B4] text-white px-8 py-2 rounded-full font-bold shadow-md hover:bg-[#003157] transition-all">Salvar Alterações</button>
          </div>
        )}
      </div>
    </div>
  );
};