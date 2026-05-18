import { LogOut } from 'lucide-react';

interface NavLogoutButtonProps {
  onLogout: () => void;
}

export const NavLogoutButton = ({ onLogout }: NavLogoutButtonProps) => (
  <button
    onClick={onLogout}
    title="Sair da conta"
    aria-label="Sair da conta"
    className="inline-flex items-center gap-2 bg-red-800 hover:bg-red-700 text-red-100 border border-red-600/50 hover:border-red-600 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-red-400/60 active:opacity-75"
  >
    <LogOut className="w-4 h-4" />
    <span className="hidden sm:inline">Sair</span>
  </button>
);
