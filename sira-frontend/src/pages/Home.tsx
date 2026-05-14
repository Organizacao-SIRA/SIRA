import React from 'react';
import { Bot, ChevronRight } from 'lucide-react';
import { AiRecommendations } from './AiRecommendations';
import type { AuthUser } from '../types';
import { AutoResizeTextarea } from '../components/ui/AutoResizeTextarea';

interface HomeProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  user: AuthUser | null;
  viewDetails: (item: any) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: (id: string) => boolean;
  setCurrentScreen: (screen: string) => void;
}

export const Home = ({ searchQuery, setSearchQuery, handleSearch, user, viewDetails, toggleFavorite, isFavorite, setCurrentScreen }: HomeProps) => (
  <div className="flex-1 flex flex-col bg-gray-50 min-h-[calc(100vh-68px)] animate-fadeIn relative overflow-hidden">
    
    {/* ÁREA CENTRAL */}
    <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto px-4 pt-10 pb-10 space-y-8">
      
      {/* MENSAGEM DE BOAS-VINDAS DA IA */}
      <div className="flex flex-col items-center gap-6 animate-fadeIn text-center mb-4">
        <div className="w-20 h-20 rounded-3xl bg-white border border-gray-100 flex items-center justify-center shadow-xl mb-2">
          <Bot className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary-dark">
            Olá, {user?.name?.split(' ')[0] || 'estudante'}! 👋
          </h1>
          <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
            Eu sou seu assistente acadêmico. Como posso ajudar na sua pesquisa hoje? 
            Escreva o que você está procurando abaixo.
          </p>
        </div>
      </div>

      {/* INPUT CENTRALIZADO NA HOME - Minimalista e Redondo */}
      <div className="w-full max-w-3xl animate-fadeIn" style={{ animationDelay: '200ms' }}>
        <form 
          onSubmit={handleSearch} 
          className="flex items-end rounded-[32px] bg-white border border-gray-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all p-1.5 pr-3"
        >
          <div className="flex-1">
            <AutoResizeTextarea
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="O que você deseja investigar hoje?..."
              required
              autoFocus
              className="pr-2"
            />
          </div>
          <div className="pb-1.5">
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-95 shadow-sm flex-shrink-0"
              aria-label="Enviar"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>

      {/* SUGESTÕES DE PROMPTS - Espaçamento Estável */}
      <div className="h-32 flex flex-col items-center justify-start">
        <div className="flex flex-wrap justify-center gap-3 opacity-70">
           {['Encontre livros sobre redes neurais', 'Artigos de 2024 sobre sustentabilidade', 'Materiais introdutórios de Python'].map(hint => (
             <button
               key={hint}
               type="button"
               onClick={() => { 
                 setSearchQuery(hint);
               }}
               className="text-sm bg-white border border-gray-100 px-6 py-2.5 rounded-xl text-gray-600 hover:border-primary hover:text-primary transition-all shadow-sm font-medium hover:shadow-md active:scale-95"
             >
               "{hint}"
             </button>
           ))}
        </div>
      </div>
    </div>

    {/* RODAPÉ INFORMATIVO */}
    <div className="py-8 text-center bg-gray-50/80 backdrop-blur-sm">
       <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
          Sistema Inteligente de Recomendações Acadêmicas
       </p>
    </div>
  </div>
);
