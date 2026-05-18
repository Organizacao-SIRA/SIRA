import React, { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { UserAvatar } from '../ui/UserAvatar';
import { uploadAvatar, removeAvatar, resolveAvatarUrl } from '../../services/api';
import type { UserProfile } from '../../types';

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  currentAvatarUrl: string | null;
  onAvatarUpdated: (profile: UserProfile) => void;
}

const ACCEPT = 'image/jpeg,image/png,image/webp';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export const AvatarUploadModal = ({
  isOpen,
  onClose,
  userName,
  currentAvatarUrl,
  onAvatarUpdated,
}: AvatarUploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const validate = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Formato inválido. Use JPG, PNG ou WEBP.';
    }
    if (file.size > MAX_BYTES) {
      return 'Imagem muito grande. O tamanho máximo é 5 MB.';
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite re-selecionar o mesmo arquivo
    if (!file) return;
    const errMsg = validate(file);
    if (errMsg) {
      setError(errMsg);
      setSelectedFile(null);
      return;
    }
    setError('');
    setSelectedFile(file);
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    setError('');
    try {
      const profile = await uploadAvatar(selectedFile);
      onAvatarUpdated(profile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar imagem. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    setError('');
    try {
      const profile = await removeAvatar();
      onAvatarUpdated(profile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao remover imagem.');
    } finally {
      setIsRemoving(false);
    }
  };

  const displayUrl = previewUrl ?? resolveAvatarUrl(currentAvatarUrl);
  const hasSelection = !!selectedFile;
  const hasCurrentAvatar = !!currentAvatarUrl;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Foto de perfil"
      size="md"
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isSaving || isRemoving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} isLoading={isSaving} disabled={!hasSelection || isRemoving}>
            Salvar foto
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-5">
        <UserAvatar name={userName} imageUrl={displayUrl} size="xl" className="ring-4 ring-surface-muted" />

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleFileSelect}
          className="sr-only"
          aria-label="Selecionar arquivo de imagem"
        />

        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving || isRemoving}
            className="flex-1"
          >
            <Upload className="w-4 h-4" />
            {hasSelection ? 'Trocar imagem' : 'Escolher imagem'}
          </Button>
          {hasCurrentAvatar && !hasSelection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              isLoading={isRemoving}
              disabled={isSaving}
              className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
              Remover foto
            </Button>
          )}
        </div>

        <p className="text-xs text-text-muted text-center max-w-xs">
          Aceitamos JPG, PNG ou WEBP de até 5 MB.<br />
          A imagem será exibida de forma circular.
        </p>

        {error && (
          <div role="alert" className="w-full p-3 bg-danger-soft text-danger-strong text-sm rounded-xl border border-danger-border font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};
