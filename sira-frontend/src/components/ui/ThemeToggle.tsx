import { Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { t } = useTranslation('common');
  const { resolved, toggle } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? t('theme.activateLight') : t('theme.activateDark')}
      title={isDark ? t('theme.light') : t('theme.dark')}
      className="w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:opacity-75"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};
