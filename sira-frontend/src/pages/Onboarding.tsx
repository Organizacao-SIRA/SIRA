import React, { useState, useEffect } from 'react';
import { GraduationCap, Settings, Sparkles, ChevronRight, Loader2, AlertCircle, Target } from 'lucide-react';
import { getPreferenceOptions } from '../services/api';
import type { PreferenceOptions } from '../types';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from '../components/ui/Button';

interface OnboardingProps {
  setCurrentScreen: (screen: string) => void;
  profileData: any;
  setProfileData: (data: any) => void;
}

export const Onboarding = ({ setCurrentScreen, profileData, setProfileData }: OnboardingProps) => {
  // Mantive o estado de opções da API (develop) para garantir que o formulário seja sempre atualizado
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

  // Sincronização de dados iniciais (develop) para permitir que o usuário retorne e edite
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

    const updated = { ...profileData, ...formData };
    setProfileData(updated);
    setCurrentScreen('interests');
  };

  // UI de Loading: Usei variáveis semânticas (primary) em vez de cores hardcoded
  if (isLoadingOptions) {
    return (
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center p-4 bg-gray-50 animate-fadeIn">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-primary-dark font-bold text-xs uppercase tracking-widest">Carregando opções...</p>
        </div>
      </div>
    );
  }

  if (optionsError) {
    return (
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center p-4 bg-gray-50 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-primary-dark mb-2">Erro ao carregar opções</h3>
          <p className="text-gray-500 text-sm mb-4">{optionsError}</p>
          <Button
            onClick={loadPreferenceOptions}
            className="px-6"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const options = preferenceOptions!;

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

        {validationErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
            {validationErrors.map((err, i) => (
              <p key={i} className="text-red-600 text-xs font-medium">{err}</p>
            ))}
          </div>
        )}

        {/* Usei space-y-6 para dar mais espaçamento vertical entre as seções (design-system) */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h3 className="text-sm font-bold text-primary-dark mb-4 flex items-center gap-2 border-b pb-2">
              <GraduationCap className="w-4 h-4" /> Perfil Acadêmico
            </h3>
            {/* Substituí os inputs nativos por componentes atômicos (Input/Select) para consistência visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Curso"
                type="text"
                placeholder="Ex: Ciência da Computação"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                required
              />
              <Select
                label="Nível de Escolaridade"
                value={formData.educationLevel}
                onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                options={options.educationLevels.map(level => ({ value: level, label: level }))}
              />
              <Select
                label="Área Principal"
                value={formData.mainArea}
                onChange={(e) => setFormData({ ...formData, mainArea: e.target.value })}
                options={[
                  { value: '', label: 'Selecione a área principal' },
                  ...options.topics.map(topic => ({ value: topic.id, label: topic.label }))
                ]}
                required
              />
              <Input
                label="Subáreas"
                type="text"
                placeholder="Ex: Machine Learning, NLP"
                value={formData.subAreas}
                onChange={(e) => setFormData({ ...formData, subAreas: e.target.value })}
              />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-primary-dark mb-4 flex items-center gap-2 border-b pb-2">
              <Settings className="w-4 h-4" /> Preferências
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Línguas</span>
                <div className="space-y-2">
                  {/* Map dinâmico baseado no backend em vez de lista estática */}
                  {options.languages.map((lang) => (
                    <Checkbox
                      key={lang}
                      label={lang}
                      checked={formData.languages.includes(lang)}
                      onChange={() => handleCheckboxChange('languages', lang, true)}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Nível</span>
                <div className="space-y-2">
                  {options.materialLevels.map((level) => (
                    <Checkbox
                      key={level}
                      label={level}
                      checked={formData.materialLevels.includes(level)}
                      onChange={() => handleCheckboxChange('materialLevels', level, true)}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Formato</span>
                <div className="space-y-2">
                  <Checkbox
                    label="Livros"
                    checked={formData.wantsBooks}
                    onChange={(e) => handleCheckboxChange('wantsBooks', e.target.checked)}
                  />
                  <Checkbox
                    label="Artigos"
                    checked={formData.wantsArticles}
                    onChange={(e) => handleCheckboxChange('wantsArticles', e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-primary-dark mb-4 flex items-center gap-2 border-b pb-2">
              <Target className="w-4 h-4" /> Objetivo Acadêmico
              <span className="text-[10px] text-gray-400 font-normal ml-1">(opcional)</span>
            </h3>
            <Select
              value={formData.academicGoal}
              onChange={(e) => setFormData({ ...formData, academicGoal: e.target.value })}
              options={[
                { value: '', label: 'Selecione (opcional)' },
                ...options.academicGoals.map(goal => ({ value: goal, label: goal }))
              ]}
            />
          </section>

          <Button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-2 group"
          >
            Avançar para Temas
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>
      </div>
    </div>
  );
};
