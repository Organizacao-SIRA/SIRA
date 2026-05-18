import logoSiraPlus from '../assets/logo sira+.png';

interface AiGreetingProps {
  userName?: string;
}

export const AiGreeting = ({ userName }: AiGreetingProps) => (
  <div className="flex flex-col items-center gap-4 sm:gap-6 animate-fadeIn text-center mb-4">
    <img src={logoSiraPlus} alt="SIRA+" className="max-w-[200px] sm:max-w-[260px] md:max-w-[290px] w-full object-contain mb-1 sm:mb-2 drop-shadow-[0_8px_32px_rgba(59,130,246,0.35)] dark:brightness-125 dark:drop-shadow-[0_8px_40px_rgba(99,153,255,0.65)] animate-fadeIn" />
    <div className="space-y-3 sm:space-y-4 max-w-2xl">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary-dark dark:text-text">
        Olá, {userName || 'estudante'}! 👋
      </h1>
      <p className="text-text-muted text-base sm:text-lg md:text-xl leading-relaxed">
        Eu sou seu assistente acadêmico. Como posso ajudar na sua pesquisa hoje?
        Escreva o que você está procurando abaixo.
      </p>
    </div>
  </div>
);
