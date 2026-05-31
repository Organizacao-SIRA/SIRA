import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PasswordStrengthMeterProps {
  password: string;
}

const RULES = [
  { labelKey: 'password.rules.minLength', test: (p: string) => p.length >= 8 },
  { labelKey: 'password.rules.uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { labelKey: 'password.rules.lowercase', test: (p: string) => /[a-z]/.test(p) },
  { labelKey: 'password.rules.number', test: (p: string) => /\d/.test(p) },
  { labelKey: 'password.rules.special', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const LEVELS = [
  { labelKey: 'password.strength.veryWeak', color: 'bg-red-500', textColor: 'text-red-500' },
  { labelKey: 'password.strength.weak', color: 'bg-orange-500', textColor: 'text-orange-500' },
  { labelKey: 'password.strength.fair', color: 'bg-amber-500', textColor: 'text-amber-500' },
  { labelKey: 'password.strength.strong', color: 'bg-lime-500', textColor: 'text-lime-500' },
  { labelKey: 'password.strength.veryStrong', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
];

export const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const { t } = useTranslation('common');
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
            {t(level.labelKey)}
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
            <span>{t(rule.labelKey)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
