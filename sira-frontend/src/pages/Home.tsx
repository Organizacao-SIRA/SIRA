import React from 'react';
import type { AuthUser } from '../types';
import { AiGreeting } from '../components/AiGreeting';
import { ChatInputForm } from '../components/ChatInputForm';
import { PromptSuggestions } from '../components/PromptSuggestions';
import { PageFooter } from '../components/ui/PageFooter';

const PROMPT_SUGGESTIONS = [
  'Encontre livros sobre redes neurais',
  'Artigos de 2024 sobre sustentabilidade',
  'Materiais introdutórios de Python',
];

interface HomeProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  user: AuthUser | null;
}

export const Home = ({ searchQuery, setSearchQuery, handleSearch, user }: HomeProps) => (
  <div className="flex-1 flex flex-col bg-surface-muted min-h-[calc(100vh-68px)] animate-fadeIn relative overflow-hidden">

    {/* Logo ancorada — min-height fixo, não encolhe quando o chat cresce */}
    <div className="min-h-[40vh] flex flex-col items-center justify-end max-w-4xl w-full mx-auto px-4 pt-10 pb-8">
      <AiGreeting userName={user?.name?.split(' ')[0]} />
    </div>

    {/* Chat + sugestões — crescem para baixo */}
    <div className="flex flex-col items-center max-w-4xl w-full mx-auto px-4 pb-10 gap-8">
      <div className="w-full max-w-3xl animate-fadeIn" style={{ animationDelay: '200ms' }}>
        <ChatInputForm
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearch}
          autoFocus
        />
      </div>
      <div className="h-32 flex flex-col items-center justify-start">
        <PromptSuggestions suggestions={PROMPT_SUGGESTIONS} onSelect={setSearchQuery} />
      </div>
    </div>

    <PageFooter text="Sistema Inteligente de Recomendações Acadêmicas" />
  </div>
);
