import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { UserMessageBubble } from '../components/UserMessageBubble';
import { AiMessageBubble } from '../components/AiMessageBubble';
import { ChatLoadingSkeleton } from '../components/ChatLoadingSkeleton';
import { MaterialsSection } from '../components/MaterialsSection';
import { PageFooter } from '../components/ui/PageFooter';

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
    setCurrentScreen('home');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn flex flex-col h-full min-h-[calc(100vh-68px)] relative">

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
        <UserMessageBubble message={searchQuery} />

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
        text="SIRA AI • Análise Baseada em Claude 3.5, Google Books e Semantic Scholar."
        variant="fixed"
      />
    </div>
  );
};
