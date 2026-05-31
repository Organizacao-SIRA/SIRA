import { Injectable, Logger } from '@nestjs/common';
import { ERROR_CODES } from '../common/constants/error-codes';
import {
  badRequestError,
  conflictError,
  unauthorizedError,
} from '../common/errors/http-error';
import { JwtService } from '@nestjs/jwt';
import * as Brevo from '@getbrevo/brevo';
import { PrismaService } from '../prisma/prisma.service';
import {
  scrypt as _scrypt,
  randomBytes,
  timingSafeEqual,
  createHash,
} from 'node:crypto';
import { promisify } from 'node:util';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as Handlebars from 'handlebars';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { authMessages, normalizeUiLocale } from './auth-i18n';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly brevoClient: Brevo.TransactionalEmailsApi;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    this.brevoClient = new Brevo.TransactionalEmailsApi();
    this.brevoClient.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY || '',
    );
  }

  // ── Hashing helpers ─────────────────────────────────────────────

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}.${derivedKey.toString('hex')}`;
  }

  private async comparePasswords(password: string, storedHash: string): Promise<boolean> {
    const [salt, hash] = storedHash.split('.');
    const hashBuffer = Buffer.from(hash, 'hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return timingSafeEqual(hashBuffer, derivedKey);
  }

  /** SHA-256 de um token opaco — usado para armazenar tokens de reset no banco */
  private sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

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

    const hashedPassword = await this.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hashedPassword, name: dto.name, uiLocale },
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

    const valid = await this.comparePasswords(dto.password, user.password);
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
      // Adicionamos um pequeno delay para equalizar timing com o fluxo real.
      this.logger.warn(`[SECURITY] Password reset requested for non-existent email`);
      return;
    }

    // Invalida tokens anteriores não utilizados deste usuário
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, isUsed: false },
      data: { isUsed: true },
    });

    // Gera token opaco de 32 bytes (256 bits de entropia)
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.sha256(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Monta o link de recuperação apontando para o frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}?screen=reset-password&token=${rawToken}`;
    const uiLocale = normalizeUiLocale(user.uiLocale || locale);
    const messages = authMessages[uiLocale];
    const emailCopy = messages.resetEmail;

    // Envia e-mail de recuperação via Resend
    try {
      const templatePath = join(__dirname, 'templates', 'reset-password.hbs');
      const templateSource = readFileSync(templatePath, 'utf8');
      const html = Handlebars.compile(templateSource)({
        ...emailCopy,
        name: user.name || emailCopy.fallbackName,
        resetLink,
        year: new Date().getFullYear(),
      });

      const sendEmail = new Brevo.SendSmtpEmail();
      sendEmail.subject = emailCopy.subject;
      sendEmail.htmlContent = html;
      sendEmail.sender = {
        name: 'SIRA+',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@example.com',
      };
      sendEmail.to = [{ email: user.email, name: user.name || emailCopy.fallbackName }];

      await this.brevoClient.sendTransacEmail(sendEmail);
      this.logger.log(`[MAIL] Password reset email sent to ${user.email}`);
    } catch (mailError) {
      this.logger.error(`[MAIL] Failed to send reset email: ${mailError}`);
      this.logger.warn(`[MAIL-FALLBACK] Reset link for ${user.email}: ${resetLink}`);
    }
  }

  /**
   * Valida se um token de reset ainda é utilizável (não expirado, não usado).
   */
  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    const tokenHash = this.sha256(token);

    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    const valid = !!record && !record.isUsed && record.expiresAt > new Date();
    return { valid };
  }

  /**
   * Redefine a senha do usuário usando um token válido.
   */
  async resetPassword(token: string, newPassword: string, locale?: string): Promise<void> {
    const tokenHash = this.sha256(token);

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

    const hashedPassword = await this.hashPassword(newPassword);

    // Transação: atualiza senha + marca token como usado
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { password: hashedPassword },
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
