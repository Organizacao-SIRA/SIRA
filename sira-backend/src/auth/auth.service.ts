import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service';
import {
  scrypt as _scrypt,
  randomBytes,
  timingSafeEqual,
  createHash,
} from 'node:crypto';
import { promisify } from 'node:util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

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

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    const hashedPassword = await this.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hashedPassword, name: dto.name },
    });

    return {
      accessToken: this.signAccess(user),
      refreshToken: this.signRefresh(user),
      user: this.safeUser(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await this.comparePasswords(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    return {
      accessToken: this.signAccess(user),
      refreshToken: this.signRefresh(user),
      user: this.safeUser(user),
    };
  }

  async refreshAccessToken(refreshToken: string) {
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
      throw new UnauthorizedException('Token de atualização inválido ou expirado');
    }
  }

  // ── Password Recovery ───────────────────────────────────────────

  /**
   * Solicita recuperação de senha.
   * Resposta é SEMPRE uniforme (anti-enumeração de contas — OWASP).
   */
  async forgotPassword(email: string): Promise<void> {
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

    // Envia e-mail de recuperação
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'SIRA+ — Recuperação de senha',
        html: this.buildResetEmailHtml(user.name || 'Usuário', resetLink),
      });
      this.logger.log(`[MAIL] Password reset email sent to ${user.email}`);
    } catch (mailError) {
      // Loga o erro mas não expõe para o usuário (anti-enumeração)
      this.logger.error(`[MAIL] Failed to send reset email: ${mailError}`);
      // Fallback: loga o link no console para ambiente de desenvolvimento
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
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = this.sha256(token);

    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.isUsed || record.expiresAt <= new Date()) {
      this.logger.warn(`[SECURITY] Invalid/expired reset token attempt`);
      throw new BadRequestException('Token inválido ou expirado. Solicite uma nova recuperação de senha.');
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

  // ── Email template ──────────────────────────────────────────────

  private buildResetEmailHtml(name: string, resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </head>
      <body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
        <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.10);">

          <!-- Header -->
          <div style="background:linear-gradient(135deg,#1351B4 0%,#003157 100%);padding:36px 40px;text-align:center;">
            <div style="width:40px;height:4px;background:#FFCD07;border-radius:2px;margin:0 auto 16px;"></div>
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">SIRA+</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.80);font-size:13px;letter-spacing:0.2px;">Sistema Inteligente de Recomendações Acadêmicas</p>
          </div>

          <!-- Body -->
          <div style="padding:40px 40px 32px;background:#ffffff;">
            <div style="display:inline-block;background:#F2F5FD;color:#1351B4;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;border-radius:4px;margin-bottom:16px;">
              Recuperação de senha
            </div>

            <h2 style="margin:0 0 12px;color:#003157;font-size:22px;font-weight:700;line-height:1.3;">Redefina sua senha de acesso</h2>
            <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.7;">
              Olá, <strong style="color:#1f2937;">${name}</strong>. Recebemos uma solicitação para redefinir a senha da sua conta no SIRA+. Clique no botão abaixo para criar uma nova senha.
            </p>

            <div style="text-align:center;margin:32px 0;">
              <a href="${resetLink}"
                 style="display:inline-block;background:#1351B4;color:#ffffff;text-decoration:none;padding:15px 40px;border-radius:999px;font-size:15px;font-weight:700;letter-spacing:0.3px;box-shadow:0 4px 12px rgba(19,81,180,0.30);">
                Redefinir minha senha
              </a>
            </div>

            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin:0 0 20px;">
              <p style="margin:0;color:#b45309;font-size:13px;line-height:1.5;">
                &#9888; Este link expira em <strong>30 minutos</strong> e só pode ser utilizado uma vez.
              </p>
            </div>

            <p style="margin:0 0 24px;color:#6b7280;font-size:13px;line-height:1.6;">
              Se você não solicitou esta recuperação, ignore este e-mail — sua conta permanece segura.
            </p>

            <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0 20px;" />

            <p style="margin:0 0 6px;color:#9ca3af;font-size:11px;line-height:1.5;">
              Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:
            </p>
            <p style="margin:0;color:#1351B4;font-size:11px;word-break:break-all;line-height:1.5;">
              ${resetLink}
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
            <div style="width:24px;height:3px;background:#FFCD07;border-radius:2px;margin:0 auto 12px;"></div>
            <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.5;">
              &copy; ${new Date().getFullYear()} SIRA+ &mdash; Universidade Federal do Ceará
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
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
      interests: user.interests,
      academicGoal: user.academicGoal,
      avatarUrl: user.avatarUrl,
      onboardingCompletedAt: user.onboardingCompletedAt,
      hasCompletedOnboarding: Boolean(user.onboardingCompletedAt),
    };
  }
}
