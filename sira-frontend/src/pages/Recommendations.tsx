import React from 'react';
import {
  Sparkles, ArrowLeft, User, Bot, ChevronRight
} from 'lucide-react';
import { RecommendationCard } from '../components/RecommendationCard';
import { Button } from '../components/ui/Button';
import { AutoResizeTextarea } from '../components/ui/AutoResizeTextarea';

interface RecommendationsProps {
  results: any[];
  aiMessage: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  setCurrentScreen: (screen: string) => void;
  viewDetails: (item: any) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: (id: any) => boolean;
  isLoading?: boolean;
}

export const Recommendations = ({
  results, aiMessage, searchQuery, setSearchQuery, handleSearch, setCurrentScreen,
  viewDetails, toggleFavorite, isFavorite, isLoading,
}: RecommendationsProps) => {

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentScreen('home'); // Volta para a tela da IA
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn flex flex-col h-full min-h-[calc(100vh-68px)] relative">
      {/* HEADER / VOLTAR */}
      <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
        <button
          onClick={handleClearSearch}
          className="flex items-center gap-2 text-primary-dark hover:text-primary transition-colors font-semibold group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-sm">Nova pesquisa</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-primary-dark hidden sm:block">Busca Inteligente</h1>
        </div>
      </div>

      <div className="flex-1 space-y-10 pb-40">
        {/* MENSAGEM DO USUÁRIO */}
        <div className="flex gap-4 animate-fadeIn justify-end">
          <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] md:max-w-2xl">
            <p className="text-sm md:text-base leading-relaxed font-medium">
              {searchQuery}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-dark flex items-center justify-center flex-shrink-0 shadow-sm">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* RESPOSTA DA IA */}
        {isLoading ? (
          <div className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-20 bg-gray-200 rounded-2xl w-full"></div>
              <div className="space-y-4 pt-4">
                <div className="h-32 bg-gray-100 rounded-2xl w-full"></div>
                <div className="h-32 bg-gray-100 rounded-2xl w-full"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 animate-fadeIn">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-6">
              {/* Balão de Texto da IA */}
              <div className="bg-white border border-gray-100 p-5 rounded-2xl rounded-tl-none shadow-sm relative">
                 <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {aiMessage}
                 </p>
              </div>

              {/* Cards de Materiais */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Materiais Selecionados</h3>
                    {results.length > 0 && (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {results.length} {results.length === 1 ? 'material' : 'materiais'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase">IA Verified</span>
                </div>

                {results.map((item: any) => (
                  <RecommendationCard
                    key={item.id}
                    item={item}
                    viewDetails={viewDetails}
                    toggleFavorite={toggleFavorite}
                    isFavorite={isFavorite(item.id)}
                  />
                ))}

                {results.length === 0 && (
                  <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center space-y-4">
                    <p className="text-gray-400 text-sm font-medium">Não consegui encontrar materiais específicos para este pedido nas bases acadêmicas no momento.</p>
                    <Button
                      onClick={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)}
                      variant="secondary"
                      size="sm"
                    >
                      Tentar novamente
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RODAPÉ INFORMATIVO (Removido input para garantir turno único) */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-10 pb-8 px-4 z-40 pointer-events-none">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
            SIRA AI • Análise Baseada em Claude 3.5, Google Books e Semantic Scholar.
          </p>
        </div>
      </div>
    </div>
  );
};
