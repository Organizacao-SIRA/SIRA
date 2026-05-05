import React, { useState, useEffect } from 'react';
import { GraduationCap, Settings, Sparkles, ChevronRight, Loader2, AlertCircle, Target } from 'lucide-react';
import { getPreferenceOptions } from '../services/api';
import type { PreferenceOptions } from '../types';

interface OnboardingProps {
  setCurrentScreen: (screen: string) => void;
  profileData: any;
  setProfileData: (data: any) => void;
}

export const Onboarding = ({ setCurrentScreen, profileData, setProfileData }: OnboardingProps) => {
  const [preferenceOptions, setPreferenceOptions] = useState<PreferenceOptions | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState('');

  const [formData, setFormData] = useState({
    course: profileData?.course || '',
    educationLevel: profileData?.educationLevel || 'Graduação',
    mainArea: profileData?.mainArea || '',
    subAreas: profileData?.subAreas || '',
    languages: profileData?.languages || ['Português'],
    materialLevels: profileData?.materialLevels || ['Intermediário'],
    wantsBooks: profileData?.wantsBooks ?? true,
    wantsArticles: profileData?.wantsArticles ?? true,
    academicGoal: profileData?.academicGoal || '',
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (profileData && profileData.course) {
      setFormData({
        course: profileData.course || '',
        educationLevel: profileData.educationLevel || 'Graduação',
        mainArea: profileData.mainArea || '',
        subAreas: profileData.subAreas || '',
        languages: profileData.languages?.length ? profileData.languages : ['Português'],
        materialLevels: profileData.materialLevels?.length ? profileData.materialLevels : ['Intermediário'],
        wantsBooks: profileData.wantsBooks ?? true,
        wantsArticles: profileData.wantsArticles ?? true,
        academicGoal: profileData.academicGoal || '',
      });
    }
  }, [profileData]);

  useEffect(() => {
    loadPreferenceOptions();
  }, []);

  const loadPreferenceOptions = async () => {
    setIsLoadingOptions(true);
    setOptionsError('');
    try {
      const options = await getPreferenceOptions();
      setPreferenceOptions(options);
    } catch (err: any) {
      setOptionsError(err.message || 'Erro ao carregar opções');
    } finally {
      setIsLoadingOptions(false);
    }
  };

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

  const validate = (): string[] => {
    const errors: string[] = [];
    if (!formData.course.trim() || formData.course.trim().length < 2) {
      errors.push('Informe o curso (mínimo 2 caracteres).');
    }
    if (!formData.mainArea.trim() || formData.mainArea.trim().length < 2) {
      errors.push('Informe a área principal (mínimo 2 caracteres).');
    }
    if (formData.languages.length === 0) {
      errors.push('Selecione pelo menos 1 idioma.');
    }
    if (formData.materialLevels.length === 0) {
      errors.push('Selecione pelo menos 1 nível de material.');
    }
    if (!formData.wantsBooks && !formData.wantsArticles) {
      errors.push('Selecione pelo menos um formato (livros ou artigos).');
    }
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);

    // Salvar dados parciais no profileData e avançar para interests
    const updated = { ...profileData, ...formData };
    setProfileData(updated);
    setCurrentScreen('interests');
  };

  if (isLoadingOptions) {
    return (
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center p-4 bg-gray-50 animate-fadeIn">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1351B4] mx-auto"></div>
          <p className="mt-4 text-[#003157] font-bold text-xs uppercase tracking-widest">Carregando opções...</p>
        </div>
      </div>
    );
  }

  if (optionsError) {
    return (
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center p-4 bg-gray-50 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#003157] mb-2">Erro ao carregar opções</h3>
          <p className="text-gray-500 text-sm mb-4">{optionsError}</p>
          <button
            onClick={loadPreferenceOptions}
            className="bg-[#1351B4] hover:bg-[#003157] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const options = preferenceOptions!;

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center p-4 bg-gray-50 animate-fadeIn">
      <div className="w-full max-w-2xl bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-4">
          <div className="w-10 h-10 bg-blue-50 text-[#1351B4] rounded-full flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[#003157]">Bem-vindo ao SIRA+</h2>
          <p className="text-gray-500 mt-1 text-xs">
            Para personalizarmos as suas recomendações, precisamos conhecer seu perfil acadêmico.
          </p>
        </div>

        {validationErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
            {validationErrors.map((err, i) => (
              <p key={i} className="text-red-600 text-xs font-medium">{err}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <section>
            <h3 className="text-sm font-bold text-[#003157] mb-3 flex items-center gap-2 border-b pb-1">
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
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#1351B4] transition-all"
                  required
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nível de Escolaridade</label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#1351B4] appearance-none cursor-pointer"
                >
                  {options.educationLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Área Principal</label>
                <select
                  value={formData.mainArea}
                  onChange={(e) => setFormData({ ...formData, mainArea: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#1351B4] appearance-none cursor-pointer"
                  required
                >
                  <option value="">Selecione a área principal</option>
                  {options.topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>{topic.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Subáreas</label>
                <input
                  type="text"
                  placeholder="Ex: Machine Learning, NLP"
                  value={formData.subAreas}
                  onChange={(e) => setFormData({ ...formData, subAreas: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#1351B4]"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-[#003157] mb-2 flex items-center gap-2 border-b pb-1">
              <Settings className="w-4 h-4" /> Preferências
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Línguas</span>
                {options.languages.map((lang) => (
                  <label key={lang} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(lang)}
                      onChange={() => handleCheckboxChange('languages', lang, true)}
                      className="rounded text-[#1351B4] w-3.5 h-3.5"
                    />
                    <span className="text-[11px] text-gray-600 group-hover:text-gray-900">{lang}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Nível</span>
                {options.materialLevels.map((level) => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.materialLevels.includes(level)}
                      onChange={() => handleCheckboxChange('materialLevels', level, true)}
                      className="rounded text-[#1351B4] w-3.5 h-3.5"
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
                    className="rounded text-[#1351B4] w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-gray-600">Livros</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.wantsArticles}
                    onChange={(e) => handleCheckboxChange('wantsArticles', e.target.checked)}
                    className="rounded text-[#1351B4] w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-gray-600">Artigos</span>
                </label>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-[#003157] mb-2 flex items-center gap-2 border-b pb-1">
              <Target className="w-4 h-4" /> Objetivo Acadêmico
              <span className="text-[10px] text-gray-400 font-normal ml-1">(opcional)</span>
            </h3>
            <select
              value={formData.academicGoal}
              onChange={(e) => setFormData({ ...formData, academicGoal: e.target.value })}
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#1351B4] appearance-none cursor-pointer"
            >
              <option value="">Selecione (opcional)</option>
              {options.academicGoals.map((goal) => (
                <option key={goal} value={goal}>{goal}</option>
              ))}
            </select>
          </section>

          <button
            type="submit"
            className="w-full bg-[#1351B4] hover:bg-[#003157] text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group mt-2"
          >
            Avançar para Temas
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};
