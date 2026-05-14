import { Bot } from 'lucide-react';

interface AiGreetingProps {
  userName?: string;
}

export const AiGreeting = ({ userName }: AiGreetingProps) => (
  <div className="flex flex-col items-center gap-6 animate-fadeIn text-center mb-4">
    <div className="w-20 h-20 rounded-3xl bg-white border border-gray-100 flex items-center justify-center shadow-xl mb-2">
      <Bot className="w-12 h-12 text-primary" />
    </div>
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-3xl md:text-4xl font-extrabold text-primary-dark">
        Olá, {userName || 'estudante'}! 👋
      </h1>
      <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
        Eu sou seu assistente acadêmico. Como posso ajudar na sua pesquisa hoje?
        Escreva o que você está procurando abaixo.
      </p>
    </div>
  </div>
);
