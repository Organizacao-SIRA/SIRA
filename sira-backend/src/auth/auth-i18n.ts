export type UiLocale = 'pt-BR' | 'en-US';

export const normalizeUiLocale = (locale?: string | null): UiLocale => {
  if (!locale) return 'pt-BR';
  return locale.toLowerCase().startsWith('en') ? 'en-US' : 'pt-BR';
};

export const authMessages = {
  'pt-BR': {
    emailAlreadyRegistered: 'E-mail já cadastrado',
    invalidCredentials: 'Credenciais inválidas',
    invalidRefreshToken: 'Token de atualização inválido ou expirado',
    missingRefreshToken: 'Refresh token não encontrado',
    resetTokenInvalid: 'Token inválido ou expirado. Solicite uma nova recuperação de senha.',
    forgotPasswordAccepted: 'Se este e-mail estiver em nossa base, um link de recuperação será enviado.',
    resetPasswordSuccess: 'Senha redefinida com sucesso. Faça login com a nova senha.',
    resetEmail: {
      lang: 'pt-BR',
      subject: 'SIRA+ - Recuperação de senha',
      tagline: 'Sistema Inteligente de Recomendações Acadêmicas',
      eyebrow: 'Recuperação de senha',
      title: 'Redefina seu acesso ao SIRA+',
      greeting: 'Olá,',
      intro: 'Recebemos uma solicitação para redefinir a senha da sua conta. Se foi você, clique no botão abaixo para criar uma nova senha.',
      button: 'Redefinir minha senha',
      expiration: 'Este link expira em',
      expirationStrong: '30 minutos',
      expirationSuffix: 'e só pode ser utilizado uma vez.',
      security: 'Se você não solicitou esta recuperação, ignore este e-mail - sua conta permanece segura.',
      fallback: 'Se o botão não funcionar, copie e cole o link abaixo no navegador:',
      footer: 'Universidade Federal do Ceará',
      fallbackName: 'Usuário',
    },
  },
  'en-US': {
    emailAlreadyRegistered: 'Email already registered',
    invalidCredentials: 'Invalid credentials',
    invalidRefreshToken: 'Invalid or expired refresh token',
    missingRefreshToken: 'Refresh token not found',
    resetTokenInvalid: 'Invalid or expired token. Request a new password recovery.',
    forgotPasswordAccepted: 'If this email is in our database, a recovery link will be sent.',
    resetPasswordSuccess: 'Password reset successfully. Sign in with your new password.',
    resetEmail: {
      lang: 'en',
      subject: 'SIRA+ - Password recovery',
      tagline: 'Intelligent Academic Recommendation System',
      eyebrow: 'Password recovery',
      title: 'Reset your SIRA+ access',
      greeting: 'Hello,',
      intro: 'We received a request to reset your account password. If this was you, click the button below to create a new password.',
      button: 'Reset my password',
      expiration: 'This link expires in',
      expirationStrong: '30 minutes',
      expirationSuffix: 'and can only be used once.',
      security: 'If you did not request this recovery, ignore this email - your account remains secure.',
      fallback: 'If the button does not work, copy and paste the link below into your browser:',
      footer: 'Federal University of Ceará',
      fallbackName: 'User',
    },
  },
} as const;
