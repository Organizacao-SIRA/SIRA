import React from 'react';
import type { AuthUser, SearchFilters } from '../types';
import { AiGreeting } from '../components/AiGreeting';
import { ChatInputForm } from '../components/ChatInputForm';
import { SearchFilters as SearchFiltersBar } from '../components/SearchFilters';
import { PageFooter } from '../components/ui/PageFooter';

interface HomeProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  user: AuthUser | null;
}

export const Home = ({ searchQuery, setSearchQuery, handleSearch, filters, setFilters, user }: HomeProps) => (
  <div className="flex h-full min-h-[calc(100vh-68px)] flex-col bg-surface-muted animate-fadeIn relative overflow-hidden">

    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="min-h-full">
        <div className="min-h-[30vh] sm:min-h-[40vh] flex flex-col items-center justify-end max-w-4xl w-full mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8">
          <AiGreeting userName={user?.name?.split(' ')[0]} />
        </div>

        <div className="flex flex-col items-center max-w-4xl w-full mx-auto px-4 sm:px-6 pb-8 sm:pb-10 gap-5 sm:gap-7">
          <div className="w-full max-w-3xl animate-fadeIn" style={{ animationDelay: '200ms' }}>
            <ChatInputForm
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearch}
              autoFocus
            />
          </div>
          <div className="w-full max-w-3xl animate-fadeIn" style={{ animationDelay: '300ms' }}>
            <SearchFiltersBar filters={filters} onChange={setFilters} />
          </div>
        </div>
      </div>
    </main>

    <PageFooter text="Resultados gerados por IA. Podem ocorrer erros, use o seu julgamento acadêmico ao selecionar os materiais." />
  </div>
);
