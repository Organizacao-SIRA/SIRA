import React, { useState } from 'react';
import { GraduationCap, Settings, Sparkles, ChevronRight } from 'lucide-react';
import { updateProfile } from '../services/api';
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h3 className="text-sm font-bold text-primary-dark mb-4 flex items-center gap-2 border-b pb-2">
              <GraduationCap className="w-4 h-4" /> Perfil Acadêmico
            </h3>
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
                options={[
                  { value: 'Graduação', label: 'Graduação' },
                  { value: 'Especialização', label: 'Especialização' },
                  { value: 'Mestrado', label: 'Mestrado' },
                  { value: 'Doutorado', label: 'Doutorado' }
                ]}
              />
              <Input
                label="Área Principal"
                type="text"
                placeholder="Ex: Inteligência Artificial"
                value={formData.mainArea}
                onChange={(e) => setFormData({ ...formData, mainArea: e.target.value })}
                required
              />
              <Input
                label="Subáreas"
                type="text"
                placeholder="Ex: Machine Learning, NLP"
                value={formData.subAreas}
                onChange={(e) => setFormData({ ...formData, subAreas: e.target.value })}
                required
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
                  {['Português', 'Inglês', 'Espanhol'].map((lang) => (
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
                  {['Introdutório', 'Intermediário', 'Avançado'].map((level) => (
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
