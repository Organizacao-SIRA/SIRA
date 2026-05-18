import { Button } from '../ui/Button';

interface EditActionBarProps {
  isSaving: boolean;
  error: string;
  onCancel: () => void;
  onSave: () => void;
}

export const EditActionBar = ({ isSaving, error, onCancel, onSave }: EditActionBarProps) => (
  <div className="flex flex-col items-end gap-3 pt-2 pb-8">
    {error && (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
    )}
    <div className="flex gap-3">
      <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
        Cancelar
      </Button>
      <Button onClick={onSave} isLoading={isSaving}>
        Salvar Alterações
      </Button>
    </div>
  </div>
);
