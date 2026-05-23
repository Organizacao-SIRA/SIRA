import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

const RULES = [
  { label: 'Mínimo de 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Letra maiúscula (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Letra minúscula (a-z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Número (0-9)', test: (p: string) => /\d/.test(p) },
  { label: 'Caractere especial (!@#$...)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const LEVELS = [
  { label: 'Muito fraca', color: 'bg-red-500', textColor: 'text-red-500' },
  { label: 'Fraca', color: 'bg-orange-500', textColor: 'text-orange-500' },
  { label: 'Razoável', color: 'bg-amber-500', textColor: 'text-amber-500' },
  { label: 'Forte', color: 'bg-lime-500', textColor: 'text-lime-500' },
  { label: 'Muito forte', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
];

export const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const passed = useMemo(() => RULES.map(r => r.test(password)), [password]);
  const score = passed.filter(Boolean).length;
  const level = score === 0 ? null : LEVELS[score - 1];

  if (!password) return null;

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* Barra de força */}
      <div className="space-y-1.5">
        <div className="flex gap-1">
          {LEVELS.map((lvl, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < score ? (level?.color || 'bg-border-strong') : 'bg-border-strong'
              }`}
            />
          ))}
        </div>
        {level && (
          <p className={`text-xs font-semibold ${level.textColor} transition-colors duration-200`}>
            {level.label}
          </p>
        )}
      </div>

      {/* Checklist de requisitos */}
      <ul className="space-y-1">
        {RULES.map((rule, i) => (
          <li
            key={i}
            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
              passed[i] ? 'text-success-strong' : 'text-text-muted'
            }`}
          >
            {passed[i] ? (
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
            )}
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
