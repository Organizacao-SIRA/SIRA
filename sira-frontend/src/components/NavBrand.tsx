import { Menu } from 'lucide-react';
import { Button } from './ui/Button';

interface NavBrandProps {
  showMenuButton: boolean;
  onMenuToggle: () => void;
  onLogoClick: () => void;
}

export const NavBrand = ({ showMenuButton, onMenuToggle, onLogoClick }: NavBrandProps) => (
  <div className="flex items-center min-w-0">
    {showMenuButton && (
      <Button
        variant="navbarAction"
        size="icon"
        aria-label="Abrir Menu Principal"
        onClick={onMenuToggle}
        title="Menu Principal"
        className="mr-2 sm:mr-3 flex-shrink-0"
      >
        <Menu className="w-5 h-5" />
      </Button>
    )}
    <button
      aria-label="Ir para a página inicial"
      onClick={onLogoClick}
      className="flex items-center min-w-0 group bg-transparent border-none p-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg"
    >
      <span className="font-bold text-xl sm:text-2xl tracking-tight flex-shrink-0">
        SIRA<span className="text-accent">+</span>
      </span>
      <span className="ml-3 border-l border-blue-400 pl-3 text-sm hidden lg:block font-light text-blue-100 leading-tight group-hover:text-white transition-colors text-left truncate">
        Sistema Inteligente de<br />Recomendação Acadêmica
      </span>
    </button>
  </div>
);
