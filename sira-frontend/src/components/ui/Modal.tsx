import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) => {
  const { t } = useTranslation('common');

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className={`relative bg-surface shadow-2xl border border-border w-full ${sizeClasses[size]} max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl`}>
        <div className="flex items-start justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-border">
          <h2 id="modal-title" className="text-base sm:text-lg font-bold text-primary-dark dark:text-text">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label={t('actions.close')}
            className="p-1.5 -m-1.5 rounded-lg text-text-subtle hover:text-text hover:bg-surface-muted transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="sira-scrollbar px-5 sm:px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>

        {footer && (
          <div className="px-5 sm:px-6 py-4 border-t border-border bg-surface-muted/40 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
