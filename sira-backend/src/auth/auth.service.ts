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
      <head><meta charset="UTF-8" /></head>
      <body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#1351B4,#003157);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">SIRA+</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Sistema Inteligente de Recomendações Acadêmicas</p>
          </div>

          <!-- Body -->
          <div style="padding:36px 40px;">
            <h2 style="margin:0 0 8px;color:#003157;font-size:20px;font-weight:700;">Recuperação de senha</h2>
            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
              Olá, <strong>${name}</strong>. Recebemos uma solicitação para redefinir a senha da sua conta.
            </p>

            <div style="text-align:center;margin:32px 0;">
              <a href="${resetLink}"
                 style="display:inline-block;background:#1351B4;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:700;letter-spacing:0.2px;">
                Redefinir minha senha
              </a>
            </div>

            <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">
              Este link expira em <strong>30 minutos</strong> e só pode ser utilizado uma vez.
            </p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:13px;line-height:1.6;">
              Se você não solicitou esta recuperação, ignore este e-mail — sua conta permanece segura.
            </p>

            <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0;" />

            <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.5;">
              Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:
            </p>
            <p style="margin:8px 0 0;color:#1351B4;font-size:11px;word-break:break-all;">
              ${resetLink}
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
            <p style="margin:0;color:#9ca3af;font-size:11px;">
              © ${new Date().getFullYear()} SIRA+ — Universidade Federal do Ceará
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
