import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ERROR_CODES } from '../common/constants/error-codes';
import { badRequestError, conflictError, unauthorizedError } from '../common/errors/http-error';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { authMessages, normalizeUiLocale } from './auth-i18n';
import { EmailService } from './email.service';
import { hashPassword, comparePasswords, sha256 } from './crypto.utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  // ── JWT helpers ─────────────────────────────────────────────────

  private signAccess(user: { id: string; email: string }): string {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }

  private signRefresh(user: { id: string }): string {
    return this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' },
    );
  }

  // ── Auth flows ──────────────────────────────────────────────────

  async register(dto: RegisterDto, locale?: string) {
    const uiLocale = normalizeUiLocale(locale);
    const messages = authMessages[uiLocale];
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw conflictError(ERROR_CODES.AUTH_EMAIL_ALREADY_REGISTERED, messages.emailAlreadyRegistered);

    const hashed = await hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hashed, name: dto.name, uiLocale },
    });

    return {
      accessToken: this.signAccess(user),
      refreshToken: this.signRefresh(user),
      user: this.safeUser(user),
    };
  }

  async login(dto: LoginDto, locale?: string) {
    const messages = authMessages[normalizeUiLocale(locale)];
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw unauthorizedError(ERROR_CODES.AUTH_INVALID_CREDENTIALS, messages.invalidCredentials);

    const valid = await comparePasswords(dto.password, user.password);
    if (!valid) throw unauthorizedError(ERROR_CODES.AUTH_INVALID_CREDENTIALS, messages.invalidCredentials);

    return {
      accessToken: this.signAccess(user),
      refreshToken: this.signRefresh(user),
      user: this.safeUser(user),
    };
  }

  async refreshAccessToken(refreshToken: string, locale?: string) {
    const messages = authMessages[normalizeUiLocale(locale)];
    try {
      const payload = this.jwtService.verify(refreshToken);
      if (payload.type !== 'refresh') throw new Error();

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new Error();

      return {
        accessToken: this.signAccess(user),
        refreshToken: this.signRefresh(user),
      };
    } catch {
      throw unauthorizedError(ERROR_CODES.AUTH_INVALID_REFRESH_TOKEN, messages.invalidRefreshToken);
    }
  }

  // ── Password Recovery ───────────────────────────────────────────

  /**
   * Solicita recuperação de senha.
   * Resposta é SEMPRE uniforme (anti-enumeração de contas — OWASP).
   */
  async forgotPassword(email: string, locale?: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Anti-enumeração: não revelamos que o e-mail não existe.
      this.logger.warn(`[SECURITY] Password reset requested for non-existent email`);
      return;
    }

    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, isUsed: false },
      data: { isUsed: true },
    });

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}?screen=reset-password&token=${rawToken}`;

    await this.emailService.sendPasswordResetEmail(
      { email: user.email, name: user.name },
      user.uiLocale || locale || null,
      resetLink,
    );
  }

  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    const tokenHash = sha256(token);
    const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    const valid = !!record && !record.isUsed && record.expiresAt > new Date();
    return { valid };
  }

  async resetPassword(token: string, newPassword: string, locale?: string): Promise<void> {
    const tokenHash = sha256(token);

    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.isUsed || record.expiresAt <= new Date()) {
      this.logger.warn(`[SECURITY] Invalid/expired reset token attempt`);
      throw badRequestError(
        ERROR_CODES.AUTH_RESET_TOKEN_INVALID,
        authMessages[normalizeUiLocale(locale)].resetTokenInvalid,
      );
    }

    const hashed = await hashPassword(newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { password: hashed },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { isUsed: true },
      }),
    ]);

    this.logger.log(`[SECURITY] Password reset completed for userId: ${record.userId}`);
  }

  // ── Helpers ─────────────────────────────────────────────────────

  private safeUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      course: user.course,
      educationLevel: user.educationLevel,
      mainArea: user.mainArea,
      subAreas: user.subAreas,
      languages: user.languages,
      materialLevels: user.materialLevels,
      wantsBooks: user.wantsBooks,
      wantsArticles: user.wantsArticles,
      uiLocale: user.uiLocale || 'pt-BR',
      interests: user.interests,
      academicGoal: user.academicGoal,
      avatarUrl: user.avatarUrl,
      onboardingCompletedAt: user.onboardingCompletedAt,
      hasCompletedOnboarding: Boolean(user.onboardingCompletedAt),
    };
  }
}
