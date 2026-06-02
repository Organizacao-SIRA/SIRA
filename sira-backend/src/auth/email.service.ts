import { Injectable, Logger } from '@nestjs/common';
import * as Brevo from '@getbrevo/brevo';
import * as Handlebars from 'handlebars';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { authMessages, normalizeUiLocale } from './auth-i18n';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly brevoClient: Brevo.TransactionalEmailsApi;

  constructor() {
    this.brevoClient = new Brevo.TransactionalEmailsApi();
    this.brevoClient.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY || '',
    );
  }

  async sendPasswordResetEmail(
    to: { email: string; name: string | null },
    locale: string | null,
    resetLink: string,
  ): Promise<void> {
    const uiLocale = normalizeUiLocale(locale);
    const emailCopy = authMessages[uiLocale].resetEmail;

    try {
      const templatePath = join(__dirname, 'templates', 'reset-password.hbs');
      const templateSource = readFileSync(templatePath, 'utf8');
      const html = Handlebars.compile(templateSource)({
        ...emailCopy,
        name: to.name || emailCopy.fallbackName,
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
      sendEmail.to = [{ email: to.email, name: to.name || emailCopy.fallbackName }];

      await this.brevoClient.sendTransacEmail(sendEmail);
      this.logger.log(`[MAIL] Password reset email sent to ${to.email}`);
    } catch (mailError) {
      this.logger.error(`[MAIL] Failed to send reset email: ${mailError}`);
      this.logger.warn(`[MAIL-FALLBACK] Reset link for ${to.email}: ${resetLink}`);
    }
  }
}
