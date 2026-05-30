import logoSiraPlus from '../assets/logo sira+.png';

interface AiGreetingProps {
  userName?: string;
  compact?: boolean;
}

export const AiGreeting = ({ userName, compact = false }: AiGreetingProps) => (
  <div className={`flex flex-col items-center animate-fadeIn text-center transition-all duration-200 ${
    compact ? 'gap-2 sm:gap-3 mb-2' : 'gap-4 sm:gap-6 mb-4'
  }`}>
    <img
      src={logoSiraPlus}
      alt="SIRA+"
      className={`w-full object-contain drop-shadow-[0_8px_32px_rgba(59,130,246,0.35)] transition-all duration-200 dark:brightness-125 dark:drop-shadow-[0_8px_40px_rgba(99,153,255,0.65)] animate-fadeIn ${
        compact
          ? 'max-w-[156px] sm:max-w-[210px] md:max-w-[240px]'
          : 'max-w-[200px] sm:max-w-[260px] md:max-w-[290px] mb-1 sm:mb-2'
      }`}
    />
    <div className={`max-w-2xl transition-all duration-200 ${
      compact ? 'space-y-1.5 sm:space-y-2' : 'space-y-3 sm:space-y-4'
    }`}>
      <h1 className={`font-extrabold text-primary-dark transition-all duration-200 dark:text-text ${
        compact ? 'text-[1.375rem] sm:text-[1.65rem] md:text-[2rem]' : 'text-2xl sm:text-3xl md:text-4xl'
      }`}>
        Olá, {userName || 'estudante'}! 👋
      </h1>
      <p className={`text-text-muted leading-relaxed transition-all duration-200 ${
        compact ? 'text-[0.9375rem] sm:text-[1.0625rem] md:text-lg' : 'text-base sm:text-lg md:text-xl'
      }`}>
        Eu sou seu assistente acadêmico. Como posso ajudar na sua pesquisa hoje?
        Escreva o que você está procurando abaixo.
      </p>
    </div>
  </div>
);
