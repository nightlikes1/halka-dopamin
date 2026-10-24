// E-posta gönderim servisi (Supabase Auth API, Nodemailer SMTP veya geliştirme için test önizlemesi)
import crypto from 'node:crypto';
import nodemailer, { type Transporter } from 'nodemailer';
import type { AppConfig } from '../../config/env.js';

export interface SendPasswordResetEmailInput {
  readonly to: string;
  readonly resetUrl: string;
}

export interface EmailService {
  sendPasswordResetEmail(input: SendPasswordResetEmailInput): Promise<void>;
}

export class NodemailerEmailService implements EmailService {
  private transporterPromise: Promise<Transporter> | null = null;

  constructor(private readonly config: AppConfig) {}

  async sendPasswordResetEmail({ to, resetUrl }: SendPasswordResetEmailInput): Promise<void> {
    if (!this.config.isProduction) {
      // eslint-disable-next-line no-console
      console.log('\n============================================================');
      // eslint-disable-next-line no-console
      console.log(`[ŞİFRE SIFIRLAMA BAĞLANTISI]: ${resetUrl}`);
      // eslint-disable-next-line no-console
      console.log('============================================================\n');
    }

    // 1. Supabase Auth yapılandırılmışsa e-postayı doğrudan Supabase Auth üzerinden gönder
    if (this.config.supabaseUrl && this.config.supabaseAnonKey) {
      try {
        const cleanAppUrl = this.config.appUrl.replace(/\/$/, '');
        const redirectUrl = `${cleanAppUrl}/reset-password`;

        // Kullanıcının Supabase Auth'ta var olduğundan emin ol (yoksa signup ile oluşturulur)
        try {
          await fetch(`${this.config.supabaseUrl}/auth/v1/signup`, {
            method: 'POST',
            headers: {
              apikey: this.config.supabaseAnonKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: to,
              password: `HalkaTemp_${crypto.randomBytes(8).toString('hex')}!`,
            }),
          });
        } catch {
          // Kullanıcı zaten varsa devam et
        }

        const recoverRes = await fetch(
          `${this.config.supabaseUrl}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectUrl)}`,
          {
            method: 'POST',
            headers: {
              apikey: this.config.supabaseAnonKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: to }),
          },
        );

        if (recoverRes.ok) {
          // eslint-disable-next-line no-console
          console.log(`[Supabase Auth]: ${to} adresine sıfırlama e-postası Supabase tarafından gönderildi.`);
          return;
        } else {
          const errText = await recoverRes.text();
          // eslint-disable-next-line no-console
          console.warn('[Supabase Auth Recover Hatası]:', errText);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[Supabase Auth Bağlantı Hatası]:', err);
      }
    }

    // 2. SMTP veya Ethereal üzerinden gönderim
    const transporter = await this.getTransporter();

    const subject = 'Halka — Şifre Sıfırlama';
    const text = [
      'Merhaba,',
      '',
      'Halka hesabınız için bir şifre sıfırlama talebinde bulundunuz.',
      'Yeni şifrenizi belirlemek için aşağıdaki bağlantıya tıklayın:',
      resetUrl,
      '',
      'Bu bağlantı 1 saat boyunca geçerlidir.',
      'Eğer bu talebi siz yapmadıysanız, bu e-postayı güvenle göz ardı edebilirsiniz.',
      '',
      'Halka',
    ].join('\n');

    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0B0B0D;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #EDE8DF;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 520px;
      margin: 40px auto;
      padding: 32px 24px;
      background-color: #141416;
      border: 1px solid #2A2824;
      border-radius: 20px;
    }
    .brand {
      text-align: center;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 4px;
      color: #EDE8DF;
      margin-bottom: 24px;
    }
    .title {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #EDE8DF;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #8A857C;
      margin-bottom: 24px;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      background-color: #C9A96E;
      color: #0B0B0D !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 14px 32px;
      border-radius: 9999px;
    }
    .footer {
      font-size: 13px;
      color: #8A857C;
      line-height: 1.5;
      border-top: 1px solid #2A2824;
      padding-top: 20px;
      margin-top: 28px;
    }
    .link-fallback {
      word-break: break-all;
      color: #C9A96E;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">HALKA</div>
    <div class="title">Şifre Sıfırlama Talebi</div>
    <div class="text">
      Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:
    </div>
    <div class="button-container">
      <a href="${resetUrl}" class="button" target="_blank" rel="noopener noreferrer">Yeni Şifre Belirle</a>
    </div>
    <div class="text" style="font-size: 13px;">
      Bu bağlantı <strong>1 saat</strong> boyunca geçerlidir. Eğer bu talebi siz göndermediyseniz, herhangi bir işlem yapmanıza gerek yoktur; hesabınız güvendedir.
    </div>
    <div class="footer">
      Buton çalışmıyorsa aşağıdaki bağlantıyı tarayıcınıza yapıştırabilirsiniz:<br>
      <a href="${resetUrl}" class="link-fallback">${resetUrl}</a>
    </div>
  </div>
</body>
</html>
    `.trim();

    try {
      const info = await transporter.sendMail({
        from: this.config.smtpFrom,
        to,
        subject,
        text,
        html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        // eslint-disable-next-line no-console
        console.log(`[E-posta Önizleme URL'si]: ${previewUrl}`);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[E-posta Gönderim Hatası]:', error);
      // eslint-disable-next-line no-console
      console.log(`[Şifre Sıfırlama Bağlantısı]: ${resetUrl}`);
      throw error;
    }
  }

  private async getTransporter(): Promise<Transporter> {
    if (!this.transporterPromise) {
      this.transporterPromise = this.createTransporter();
    }
    return this.transporterPromise;
  }

  private async createTransporter(): Promise<Transporter> {
    if (this.config.smtpHost && this.config.smtpUser) {
      return nodemailer.createTransport({
        host: this.config.smtpHost,
        port: this.config.smtpPort,
        secure: this.config.smtpSecure,
        auth: {
          user: this.config.smtpUser,
          pass: this.config.smtpPass,
        },
      });
    }

    try {
      const testAccount = await nodemailer.createTestAccount();
      // eslint-disable-next-line no-console
      console.log('[Ethereal E-posta Test Hesabı Açıldı]:', testAccount.user);
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch {
      return nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }
}
