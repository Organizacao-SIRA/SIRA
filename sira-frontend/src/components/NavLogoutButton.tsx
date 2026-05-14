import { LogOut } from 'lucide-react';

interface NavLogoutButtonProps {
  onLogout: () => void;
}

export const NavLogoutButton = ({ onLogout }: NavLogoutButtonProps) => (
  <button
    onClick={onLogout}
    title="Sair da conta"
    aria-label="Sair da conta"
    className="flex items-center gap-1.5 bg-red-400/80 hover:bg-red-400 text-white border border-red-300/30 rounded-full px-3 py-2 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-red-300/50"
  >
    <LogOut className="w-4 h-4" />
    <span className="hidden sm:inline">Sair</span>
  </button>
);
