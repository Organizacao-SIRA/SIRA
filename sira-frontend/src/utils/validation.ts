/**
 * Regras de validação compartilhadas entre o medidor de força de senha
 * (PasswordStrengthMeter) e a validação dos formulários de auth.
 */
export const PASSWORD_RULES = [
  { labelKey: 'password.rules.minLength', test: (p: string) => p.length >= 8 },
  { labelKey: 'password.rules.uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { labelKey: 'password.rules.lowercase', test: (p: string) => /[a-z]/.test(p) },
  { labelKey: 'password.rules.number', test: (p: string) => /\d/.test(p) },
  { labelKey: 'password.rules.special', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

export const isStrongPassword = (password: string): boolean =>
  PASSWORD_RULES.every((rule) => rule.test(password));

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean => EMAIL_REGEX.test(email.trim());
