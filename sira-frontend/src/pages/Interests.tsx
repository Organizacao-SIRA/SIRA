import React, { useState } from 'react';
import {
  Cpu, Landmark, Scale, LineChart, GraduationCap,
  Activity, TrendingUp, Users, Globe, ChevronRight, CheckCircle2
} from 'lucide-react';
import { updateProfile } from '../services/api';

const AVAILABLE_THEMES = [
  { id: 'ia', label: 'Inteligência Artificial', icon: Cpu },
  { id: 'gp', label: 'Gestão Pública', icon: Landmark },
  { id: 'dir', label: 'Direito e Legislação', icon: Scale },
  { id: 'cd', label: 'Ciência de Dados', icon: LineChart },
  { id: 'edu', label: 'Educação e Pedagogia', icon: GraduationCap },
  { id: 'sau', label: 'Saúde Pública', icon: Activity },
  { id: 'eco', label: 'Economia e Finanças', icon: TrendingUp },
  { id: 'soc', label: 'Sociologia', icon: Users },
  { id: 'amb', label: 'Meio Ambiente', icon: Globe },
];

interface InterestsProps {
  setCurrentScreen: (screen: string) => void;
  profileData: any;
  setProfileData: (data: any) => void;
}

export const Interests = ({ setCurrentScreen, profileData, setProfileData }: InterestsProps) => {
  const [selected, setSelected] = useState<string[]>(profileData?.interests || []);

  const toggleTheme = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setProfileData({ ...profileData, interests: selected });
    try {
      await updateProfile({ interests: selected });
    } catch {
      // salva em estado mesmo se a API falhar
    }
    setCurrentScreen('home');
  };

  return (
    <div className="h-[calc(100vh-68px)] flex items-center justify-center p-4 bg-gray-50 overflow-hidden">
      <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 animate-fadeIn">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#003157]">Quais temas te interessam?</h2>
          <p className="text-gray-500 mt-1 text-xs">Selecione as áreas para personalizar suas recomendações.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {AVAILABLE_THEMES.map((theme) => {
            const Icon = theme.icon;
            const isSelected = selected.includes(theme.id);
            return (
              <button
                key={theme.id}
                onClick={() => toggleTheme(theme.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer h-24 relative ${
                  isSelected ? 'border-[#1351B4] bg-blue-50/50 shadow-sm' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'
                }`}
              >
                {isSelected && (
                  <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-[#1351B4]" />
                )}
                <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-[#1351B4]' : 'text-gray-300'}`} />
                <span className={`text-[10px] font-bold leading-tight text-center ${isSelected ? 'text-[#003157]' : 'text-gray-600'}`}>
                  {theme.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {selected.length} Selecionados
          </span>
          <button
            onClick={handleFinish}
            className="bg-[#1351B4] hover:bg-[#003157] text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            Concluir e Acessar
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};