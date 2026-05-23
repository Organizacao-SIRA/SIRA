import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface NavLogoutButtonProps {
  onLogout: () => void;
}

export const NavLogoutButton = ({ onLogout }: NavLogoutButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await onLogout();
    setIsLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Sair da conta"
        aria-label="Sair da conta"
        className="inline-flex items-center justify-center gap-2 bg-red-800 hover:bg-red-700 text-red-100 border border-red-600/50 hover:border-red-600 rounded-full px-3 sm:px-4 h-9 sm:h-10 text-sm font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-red-400/60 active:opacity-75 flex-shrink-0"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Sair</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => !isLoading && setIsOpen(false)}
        title="Sair da conta"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isLoading}
              onClick={handleConfirm}
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        }
      >
        <p className="text-text-muted text-sm leading-relaxed">
          Tem certeza que deseja sair? Você precisará fazer login novamente para acessar sua conta.
        </p>
      </Modal>
    </>
  );
};
