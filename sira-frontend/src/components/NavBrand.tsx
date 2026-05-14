import { Menu } from 'lucide-react';

interface NavBrandProps {
  showMenuButton: boolean;
  onMenuToggle: () => void;
  onLogoClick: () => void;
}

export const NavBrand = ({ showMenuButton, onMenuToggle, onLogoClick }: NavBrandProps) => (
  <div className="flex items-center">
    {showMenuButton && (
      <button
        aria-label="Abrir Menu Principal"
        onClick={onMenuToggle}
        className="mr-4 p-2 hover:bg-primary-dark rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white"
        title="Menu Principal"
      >
        <Menu className="w-6 h-6" />
      </button>
    )}
    <button
      aria-label="Ir para a página inicial"
      onClick={onLogoClick}
      className="flex items-center group bg-transparent border-none p-0 focus:outline-none"
    >
      <span className="font-bold text-2xl tracking-tight">
        SIRA<span className="text-accent">+</span>
      </span>
      <span className="ml-3 border-l border-blue-400 pl-3 text-sm hidden md:block font-light text-blue-100 leading-tight group-hover:text-white transition-colors text-left">
        Sistema Inteligente de<br />Recomendação Acadêmica
      </span>
    </button>
  </div>
);
