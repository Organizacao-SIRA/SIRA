import React, { useEffect, useRef, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { UserAvatar } from '../ui/UserAvatar';
import { uploadAvatar, removeAvatar, resolveAvatarUrl } from '../../services/api';
import { toast } from '../../toast';
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
  const { t } = useTranslation(['profile', 'common']);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
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
      return t('avatar.invalidFormat');
    }
    if (file.size > MAX_BYTES) {
      return t('avatar.tooLarge');
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite re-selecionar o mesmo arquivo
    if (!file) return;
    const errMsg = validate(file);
    if (errMsg) {
      toast.error(errMsg);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    try {
      const profile = await uploadAvatar(selectedFile);
      onAvatarUpdated(profile);
      toast.success(t('toast.avatarUpdated'));
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('avatar.uploadError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const profile = await removeAvatar();
      onAvatarUpdated(profile);
      toast.success(t('toast.avatarRemoved'));
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('avatar.removeError'));
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
      title={t('avatar.title')}
      size="md"
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isSaving || isRemoving}>
            {t('common:actions.cancel')}
          </Button>
          <Button onClick={handleSave} isLoading={isSaving} disabled={!hasSelection || isRemoving}>
            {t('avatar.savePhoto')}
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
          aria-label={t('avatar.selectFile')}
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
            {hasSelection ? t('avatar.replaceImage') : t('avatar.chooseImage')}
          </Button>
          {hasCurrentAvatar && !hasSelection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              isLoading={isRemoving}
              disabled={isSaving}
              className="flex-1 text-danger-strong hover:bg-danger-soft"
            >
              <Trash2 className="w-4 h-4" />
              {t('avatar.removePhoto')}
            </Button>
          )}
        </div>

        <p className="text-xs text-text-muted text-center max-w-xs">
          <Trans i18nKey="avatar.hint" ns="profile" components={{ br: <br /> }} />
        </p>
      </div>
    </Modal>
  );
};
