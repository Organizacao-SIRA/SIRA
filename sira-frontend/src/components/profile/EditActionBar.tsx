import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

interface EditActionBarProps {
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const EditActionBar = ({ isSaving, onCancel, onSave }: EditActionBarProps) => {
  const { t } = useTranslation(['profile', 'common']);

  return (
    <div className="flex flex-col items-stretch sm:items-end gap-3 pt-2 pb-6 sm:pb-8">
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
      <Button variant="secondary" onClick={onCancel} disabled={isSaving} className="w-full sm:w-auto">
        {t('common:actions.cancel')}
      </Button>
      <Button onClick={onSave} isLoading={isSaving} className="w-full sm:w-auto">
        {t('actions.saveChanges')}
      </Button>
    </div>
    </div>
  );
};
