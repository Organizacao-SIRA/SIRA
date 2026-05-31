import { useTranslation } from 'react-i18next';
import { SiraLogo } from './ui/SiraLogo';

interface AiGreetingProps {
  userName?: string;
  compact?: boolean;
}

export const AiGreeting = ({ userName, compact = false }: AiGreetingProps) => {
  const { t } = useTranslation('home');
  const displayName = userName || t('greeting.fallbackName');

  return (
    <div className={`flex flex-col items-center animate-fadeIn text-center transition-all duration-200 ${
      compact ? 'gap-2 sm:gap-3 mb-2' : 'gap-4 sm:gap-6 mb-4'
    }`}>
      <SiraLogo
        size={compact ? 'xl' : 'hero'}
        tone="brand"
        className={`drop-shadow-[0_8px_28px_rgba(59,130,246,0.16)] transition-all duration-200 dark:drop-shadow-[0_8px_34px_rgba(99,153,255,0.28)] ${
          compact ? '' : 'mb-1 sm:mb-2'
        }`}
      />
      <div className={`max-w-2xl transition-all duration-200 ${
        compact ? 'space-y-1.5 sm:space-y-2' : 'space-y-3 sm:space-y-4'
      }`}>
        <h1 className={`font-extrabold text-primary-dark transition-all duration-200 dark:text-text ${
          compact ? 'text-[1.375rem] sm:text-[1.65rem] md:text-[2rem]' : 'text-2xl sm:text-3xl md:text-4xl'
        }`}>
          {t('greeting.title', { name: displayName })}
        </h1>
        <p className={`text-text-muted leading-relaxed transition-all duration-200 ${
          compact ? 'text-[0.9375rem] sm:text-[1.0625rem] md:text-lg' : 'text-base sm:text-lg md:text-xl'
        }`}>
          {t('greeting.description')}
        </p>
      </div>
    </div>
  );
};
