import React, { useState, useEffect } from 'react';
import {
  Cpu, Landmark, Scale, LineChart, GraduationCap,
  Activity, TrendingUp, Users, Globe, ChevronRight, CheckCircle2,
  ChevronLeft, Loader2, AlertCircle
} from 'lucide-react';
import { completeOnboarding, getPreferenceOptions } from '../services/api';
import type { PreferenceTopic } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

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

interface InterestsProps {
  setCurrentScreen: (screen: string) => void;
  profileData: any;
  setProfileData: (data: any) => void;
}

export const Interests = ({ setCurrentScreen, profileData, setProfileData }: InterestsProps) => {
  const { updateUser } = useAuth();
  const [selected, setSelected] = useState<string[]>(() => {
    const initial = profileData?.interests || [];
    if (profileData?.mainArea && !initial.includes(profileData.mainArea)) {
      return [...initial, profileData.mainArea];
    }
    return initial;
  });
  const [topics, setTopics] = useState<PreferenceTopic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setIsLoadingTopics(true);
    setError('');
    try {
      const options = await getPreferenceOptions();
      setTopics(options.topics);
    } catch (err: any) {
      setError(err.message || 'Não foi possível carregar os temas. Por favor, recarregue a página.');
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const toggleTheme = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    if (selected.length < 3) return;

    setIsSaving(true);
    setError('');

    const payload = {
      course: profileData.course,
      educationLevel: profileData.educationLevel,
      mainArea: profileData.mainArea,
      subAreas: profileData.subAreas || undefined,
      languages: profileData.languages,
      materialLevels: profileData.materialLevels,
      wantsBooks: profileData.wantsBooks,
      wantsArticles: profileData.wantsArticles,
      interests: selected,
      academicGoal: profileData.academicGoal || undefined,
    };

    try {
      const updatedUser = await completeOnboarding(payload);
      updateUser({ hasCompletedOnboarding: true });

      setProfileData({
        ...profileData,
        ...updatedUser,
        interests: selected,
        hasCompletedOnboarding: true,
        onboardingCompletedAt: updatedUser.onboardingCompletedAt,
      });
      setCurrentScreen('home');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar preferências. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const canFinish = selected.length >= 3;

  if (isLoadingTopics) {
    return (
      <div className="h-[calc(100vh-68px)] flex items-center justify-center p-4 bg-surface-muted animate-fadeIn">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-primary-dark dark:text-text font-bold text-xs uppercase tracking-widest">Carregando temas...</p>
        </div>
      </div>
    );
  }

  if (error && topics.length === 0) {
    return (
      <div className="h-[calc(100vh-68px)] flex items-center justify-center p-4 bg-surface-muted animate-fadeIn">
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-8 max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-warning-strong mx-auto mb-3" />
          <h3 className="text-lg font-bold text-primary-dark dark:text-text mb-2">Erro ao carregar temas</h3>
          <p className="text-text-muted text-sm mb-4">{error}</p>
          <Button onClick={loadTopics} className="px-6">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-68px)] flex items-center justify-center p-4 bg-surface-muted overflow-hidden">
      <div className="w-full max-w-2xl bg-surface p-6 md:p-8 rounded-2xl shadow-lg border border-border animate-fadeIn">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-primary-dark dark:text-text">Quais temas te interessam?</h2>
          <p className="text-text-muted mt-1 text-xs">
            Selecione pelo menos <span className="font-bold text-primary">3 áreas</span> para personalizar suas recomendações.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger-soft border border-danger-border rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-danger-strong mt-0.5 flex-shrink-0" />
            <p className="text-danger-strong text-xs font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {topics.map((topic) => {
            const Icon = TOPIC_ICONS[topic.id] || Globe;
            const isSelected = selected.includes(topic.id);
            return (
              <button
                key={topic.id}
                onClick={() => toggleTheme(topic.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer h-24 relative ${
                  isSelected
                    ? 'border-primary bg-primary-soft shadow-sm'
                    : 'border-border bg-surface-muted hover:border-border-strong'
                }`}
                title={topic.description}
              >
                {isSelected && (
                  <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />
                )}
                <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary' : 'text-text-subtle'}`} />
                <span className={`text-[10px] font-bold leading-tight text-center ${isSelected ? 'text-primary' : 'text-text-muted'}`}>
                  {topic.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentScreen('onboarding')}
              className="text-text-muted hover:text-primary text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${canFinish ? 'text-success-strong' : 'text-text-subtle'}`}>
              {selected.length} / 3 mín. selecionados
            </span>
          </div>
          <Button
            onClick={handleFinish}
            disabled={!canFinish || isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                Concluir e Acessar
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
