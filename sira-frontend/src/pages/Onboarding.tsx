import React, { useState } from 'react';
import { GraduationCap, Settings, Sparkles, ChevronRight } from 'lucide-react';
import { updateProfile } from '../services/api';

interface OnboardingProps {
  setCurrentScreen: (screen: string) => void;
  profileData: any;
  setProfileData: (data: any) => void;
}

export const Onboarding = ({ setCurrentScreen, profileData, setProfileData }: OnboardingProps) => {
  const [formData, setFormData] = useState({
    course: profileData?.course || '',
    educationLevel: profileData?.educationLevel || 'Graduação',
    mainArea: profileData?.mainArea || '',
    subAreas: profileData?.subAreas || '',
    languages: profileData?.languages || ['Português'],
    materialLevels: profileData?.materialLevels || ['Intermediário'],
    wantsBooks: profileData?.wantsBooks ?? true,
    wantsArticles: profileData?.wantsArticles ?? true,
  });

  const handleCheckboxChange = (field: string, value: string | boolean, isArray = false) => {
    if (isArray) {
      const currentArray = formData[field as keyof typeof formData] as string[];
      const newArray = currentArray.includes(value as string)
        ? currentArray.filter((i) => i !== value)
        : [...currentArray, value as string];
      setFormData({ ...formData, [field]: newArray });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...profileData, ...formData };
    setProfileData(updated);
    try {
      await updateProfile(formData);
    } catch {
      // salva em estado mesmo se a API falhar
    }
    setCurrentScreen('interests');
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center p-4 bg-gray-50 animate-fadeIn">
      <div className="w-full max-w-2xl bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-4">
          <div className="w-10 h-10 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-primary-dark">Bem-vindo ao SIRA+</h2>
          <p className="text-gray-500 mt-1 text-xs">
            Para personalizarmos as suas recomendações, precisamos conhecer seu perfil acadêmico.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <section>
            <h3 className="text-sm font-bold text-primary-dark mb-3 flex items-center gap-2 border-b pb-1">
              <GraduationCap className="w-4 h-4" /> Perfil Acadêmico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Curso</label>
                <input
                  type="text"
                  placeholder="Ex: Ciência da Computação"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition-all"
                  required
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nível de Escolaridade</label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none focus:border-primary appearance-none cursor-pointer"
                >
                  <option>Graduação</option>
                  <option>Especialização</option>
                  <option>Mestrado</option>
                  <option>Doutorado</option>
                </select>
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Área Principal</label>
                <input
                  type="text"
                  placeholder="Ex: Inteligência Artificial"
                  value={formData.mainArea}
                  onChange={(e) => setFormData({ ...formData, mainArea: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Subáreas</label>
                <input
                  type="text"
                  placeholder="Ex: Machine Learning, NLP"
                  value={formData.subAreas}
                  onChange={(e) => setFormData({ ...formData, subAreas: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none focus:border-primary"
                  required
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-primary-dark mb-2 flex items-center gap-2 border-b pb-1">
              <Settings className="w-4 h-4" /> Preferências
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Línguas</span>
                {['Português', 'Inglês', 'Espanhol'].map((lang) => (
                  <label key={lang} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(lang)}
                      onChange={() => handleCheckboxChange('languages', lang, true)}
                      className="rounded text-primary w-3.5 h-3.5"
                    />
                    <span className="text-[11px] text-gray-600 group-hover:text-gray-900">{lang}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Nível</span>
                {['Introdutório', 'Intermediário', 'Avançado'].map((level) => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.materialLevels.includes(level)}
                      onChange={() => handleCheckboxChange('materialLevels', level, true)}
                      className="rounded text-primary w-3.5 h-3.5"
                    />
                    <span className="text-[11px] text-gray-600 group-hover:text-gray-900">{level}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Formato</span>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.wantsBooks}
                    onChange={(e) => handleCheckboxChange('wantsBooks', e.target.checked)}
                    className="rounded text-primary w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-gray-600">Livros</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.wantsArticles}
                    onChange={(e) => handleCheckboxChange('wantsArticles', e.target.checked)}
                    className="rounded text-primary w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-gray-600">Artigos</span>
                </label>
              </div>
            </div>
          </section>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group mt-2"
          >
            Avançar para Temas
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};
