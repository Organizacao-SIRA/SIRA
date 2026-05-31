import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';
import { SiraLogo } from './ui/SiraLogo';

interface NavBrandProps {
  showMenuButton: boolean;
  onMenuToggle: () => void;
  onLogoClick: () => void;
}

export const NavBrand = ({ showMenuButton, onMenuToggle, onLogoClick }: NavBrandProps) => {
  const { t } = useTranslation('navigation');

  return (
    <div className="flex items-center min-w-0">
      {showMenuButton && (
        <Button
          variant="navbarAction"
          size="icon"
          aria-label={t('menu.open')}
          onClick={onMenuToggle}
          title={t('menu.title')}
          className="mr-2 sm:mr-3 flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}
      <button
        aria-label={t('brand.home')}
        onClick={onLogoClick}
        className="flex items-center min-w-0 group bg-transparent border-none p-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg"
      >
        <SiraLogo size="sm" tone="light" className="flex-shrink-0" />
        <span className="ml-3 border-l border-blue-400 pl-3 text-sm hidden lg:block font-light text-blue-100 leading-tight group-hover:text-white transition-colors text-left truncate">
          {t('brand.taglineLine1')}<br />{t('brand.taglineLine2')}
        </span>
      </button>
    </div>
  );
};
