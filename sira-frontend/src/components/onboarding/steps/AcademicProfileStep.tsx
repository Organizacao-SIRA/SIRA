import { GraduationCap } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import type { OnboardingFormData, StepFieldErrors } from '../../../types/onboarding';
import type { PreferenceOptions } from '../../../types';

interface AcademicProfileStepProps {
  data: OnboardingFormData;
  errors: StepFieldErrors;
  options: PreferenceOptions;
  onChange: <K extends keyof OnboardingFormData>(field: K, value: OnboardingFormData[K]) => void;
}

export const AcademicProfileStep = ({ data, errors, options, onChange }: AcademicProfileStepProps) => (
  <div className="space-y-6 max-w-2xl mx-auto">
    <header className="flex items-start gap-3">
      <div className="p-2 bg-primary-soft rounded-lg text-primary">
        <GraduationCap className="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-primary-dark dark:text-text">Seu perfil acadêmico</h2>
        <p className="text-sm text-text-muted mt-0.5">
          Essas informações ajudam o SIRA+ a recomendar conteúdo no seu nível.
        </p>
      </div>
    </header>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input
        label="Curso"
        type="text"
        placeholder="Ex: Ciência da Computação"
        value={data.course}
        onChange={(e) => onChange('course', e.target.value)}
        error={errors.course}
        required
      />
      <Select
        label="Nível de Escolaridade"
        value={data.educationLevel}
        onChange={(e) => onChange('educationLevel', e.target.value)}
        options={options.educationLevels.map((level) => ({ value: level, label: level }))}
      />
      <Select
        label="Área Principal"
        value={data.mainArea}
        onChange={(e) => onChange('mainArea', e.target.value)}
        error={errors.mainArea}
        options={[
          { value: '', label: 'Selecione a área principal' },
          ...options.topics.map((topic) => ({ value: topic.id, label: topic.label })),
        ]}
        required
      />
      <Input
        label="Subáreas (opcional)"
        type="text"
        placeholder="Ex: Machine Learning, NLP"
        value={data.subAreas}
        onChange={(e) => onChange('subAreas', e.target.value)}
      />
    </div>
  </div>
);
