import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { UserMessageBubble } from '../components/UserMessageBubble';
import { AiMessageBubble } from '../components/AiMessageBubble';
import { ChatLoadingSkeleton } from '../components/ChatLoadingSkeleton';
import { MaterialsSection } from '../components/MaterialsSection';
import { PageFooter } from '../components/ui/PageFooter';
import type { AuthUser } from '../types';

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
  user?: AuthUser | null;
}

export const Recommendations = ({
  results, aiMessage, searchQuery, setSearchQuery, handleSearch, setCurrentScreen,
  viewDetails, toggleFavorite, isFavorite, isLoading, user,
}: RecommendationsProps) => {

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentScreen('home');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fadeIn flex flex-col min-h-[calc(100vh-68px)] relative">

      <div className="mb-6 sm:mb-8 flex items-center justify-between gap-3 border-b border-border pb-4">
        <button
          type="button"
          onClick={handleClearSearch}
          className="flex items-center gap-2 text-primary-dark dark:text-text hover:text-primary transition-colors font-semibold group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md px-1 py-1"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-sm">Nova pesquisa</span>
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 bg-primary-soft rounded-lg flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-base sm:text-xl font-bold text-primary-dark dark:text-text hidden sm:block truncate">Busca Inteligente</h1>
        </div>
      </div>

      <div className="flex-1 space-y-8 sm:space-y-10 pb-32 sm:pb-40">
        <UserMessageBubble message={searchQuery} user={user} />

        {isLoading ? (
          <ChatLoadingSkeleton />
        ) : (
          <AiMessageBubble message={aiMessage}>
            <MaterialsSection
              results={results}
              onRetry={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)}
              viewDetails={viewDetails}
              toggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
            />
          </AiMessageBubble>
        )}
      </div>

      <PageFooter
        text="Resultados gerados por IA. Podem ocorrer erros, use o seu julgamento acadêmico ao selecionar os materiais."
        variant="sticky"
      />
    </div>
  );
};
