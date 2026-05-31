import { useTranslation } from 'react-i18next';

interface SiraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  tone?: 'brand' | 'light' | 'inherit';
  showTagline?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-3xl',
  lg: 'text-5xl sm:text-6xl',
  xl: 'text-5xl xl:text-6xl',
  hero: 'text-6xl sm:text-7xl xl:text-8xl',
};

const TONE_CLASSES = {
  brand: {
    text: 'text-primary-dark dark:text-text',
    plus: 'text-accent',
    tagline: 'text-text-muted',
  },
  light: {
    text: 'text-white',
    plus: 'text-accent',
    tagline: 'text-blue-100',
  },
  inherit: {
    text: 'text-current',
    plus: 'text-accent',
    tagline: 'text-current opacity-70',
  },
};

export const SiraLogo = ({
  size = 'md',
  tone = 'brand',
  showTagline = false,
  className = '',
}: SiraLogoProps) => {
  const { t } = useTranslation('navigation');
  const colors = TONE_CLASSES[tone];

  return (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span
        aria-label="SIRA+"
        className={`${SIZE_CLASSES[size]} ${colors.text} font-extrabold leading-none transition-all duration-200`}
      >
        <span aria-hidden="true">SIRA</span>
        <span aria-hidden="true" className={colors.plus}>+</span>
      </span>
      {showTagline && (
        <span className={`mt-2 text-xs font-medium leading-snug ${colors.tagline}`}>
          {t('brand.taglineLine1')} {t('brand.taglineLine2')}
        </span>
      )}
    </span>
  );
};
