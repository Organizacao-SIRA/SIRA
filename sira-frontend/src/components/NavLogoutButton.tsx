import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface NavLogoutButtonProps {
  onLogout: () => void;
}

export const NavLogoutButton = ({ onLogout }: NavLogoutButtonProps) => {
  const { t } = useTranslation(['navigation', 'common']);
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
        title={t('logout.title')}
        aria-label={t('logout.title')}
        data-testid="nav-logout-button"
        className="inline-flex items-center justify-center gap-2 bg-danger-fill hover:bg-danger-fill-hover text-white border border-white/15 rounded-full px-3 sm:px-4 h-9 sm:h-10 text-sm font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/60 active:opacity-75 flex-shrink-0"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">{t('logout.label')}</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => !isLoading && setIsOpen(false)}
        title={t('logout.title')}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isLoading}
              onClick={handleConfirm}
              data-testid="nav-logout-confirm"
            >
              <LogOut className="w-4 h-4" />
              {t('logout.confirm')}
            </Button>
          </div>
        }
      >
        <p className="text-text-muted text-sm leading-relaxed">
          {t('logout.confirmMessage')}
        </p>
      </Modal>
    </>
  );
};
