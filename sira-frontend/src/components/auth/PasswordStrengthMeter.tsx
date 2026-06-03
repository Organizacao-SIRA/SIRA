import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PASSWORD_RULES as RULES } from '../../utils/validation';

interface PasswordStrengthMeterProps {
  password: string;
}

const LEVELS = [
  { labelKey: 'password.strength.veryWeak', color: 'bg-danger-fill', textColor: 'text-danger-strong' },
  { labelKey: 'password.strength.weak', color: 'bg-danger-strong', textColor: 'text-danger-strong' },
  { labelKey: 'password.strength.fair', color: 'bg-warning-strong', textColor: 'text-warning-strong' },
  { labelKey: 'password.strength.strong', color: 'bg-success-strong', textColor: 'text-success-strong' },
  { labelKey: 'password.strength.veryStrong', color: 'bg-success-strong', textColor: 'text-success-strong' },
];

export const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const { t } = useTranslation('common');
  const passed = useMemo(() => RULES.map(r => r.test(password)), [password]);
  const score = passed.filter(Boolean).length;
  const level = score === 0 ? null : LEVELS[score - 1];

  if (!password) return null;

  return (
    <div className="space-y-2 animate-fadeIn">
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
            {t(level.labelKey)}
          </p>
        )}
      </div>

      {/* Checklist de requisitos — 2 colunas para reduzir a altura vertical */}
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {RULES.map((rule, i) => (
          <li
            key={i}
            className={`flex items-center gap-1.5 text-xs leading-tight transition-colors duration-200 ${
              passed[i] ? 'text-success-strong' : 'text-text-muted'
            }`}
          >
            {passed[i] ? (
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
            )}
            <span className="min-w-0">{t(rule.labelKey)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
