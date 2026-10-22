// Kayıt, giriş, oturum sahibi bilgisi ve şifre sıfırlama iş mantığı
import crypto from 'node:crypto';
import type { AppConfig } from '../../config/env.js';
import { badRequest, conflict, notFound, unauthorized } from '../../core/errors.js';
import type { TokenPayload } from '../../plugins/auth.js';
import type { AuthResponse, LoginInput, PublicUser, RegisterInput } from './auth.schemas.js';
import type { EmailService } from './email.service.js';
import type { PasswordHasher } from './passwordHasher.js';
import type { PasswordResetTokenRepository } from './passwordResetToken.repository.js';
import type { UserRecord, UserRepository } from './user.repository.js';

export interface TokenSigner {
  sign(payload: TokenPayload): string;
}

const INVALID_CREDENTIALS = 'E-posta veya şifre hatalı.';
const RESET_TOKEN_EXPIRES_MS = 60 * 60 * 1000; // 1 saat

const toPublicUser = (user: UserRecord): PublicUser => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
});

export class AuthService {
  // Kullanıcı yokken de hash karşılaştırması yapılır; yanıt süresinden e-posta tahmin edilemez
  private dummyHash: Promise<string> | null = null;

  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenSigner,
    private readonly resetTokens: PasswordResetTokenRepository,
    private readonly emailService: EmailService,
    private readonly config?: AppConfig,
  ) {}

  async register(input: RegisterInput): Promise<AuthResponse> {
    if (await this.users.findByEmail(input.email)) {
      throw conflict('Bu e-posta adresi zaten kayıtlı.');
    }
    const user = await this.users.create({
      email: input.email,
      passwordHash: await this.hasher.hash(input.password),
      displayName: input.displayName ?? null,
    });
    return this.issue(user);
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.users.findByEmail(input.email);
    if (!user) {
      await this.hasher.verify(input.password, await this.getDummyHash());
      throw unauthorized(INVALID_CREDENTIALS);
    }
    if (!(await this.hasher.verify(input.password, user.passwordHash))) {
      throw unauthorized(INVALID_CREDENTIALS);
    }
    return this.issue(user);
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) throw notFound('Kullanıcı bulunamadı.');
    return toPublicUser(user);
  }

  async forgotPassword(email: string, appUrl: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw notFound('Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.');
    }

    // Varsa önceki kullanılmamış belirteçleri geçersiz kıl
    await this.resetTokens.invalidateAllForUser(user.id);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_MS);

    await this.resetTokens.create(user.id, tokenHash, expiresAt);

    const cleanAppUrl = appUrl.replace(/\/$/, '');
    const resetUrl = `${cleanAppUrl}/reset-password?token=${rawToken}`;

    await this.emailService.sendPasswordResetEmail({
      to: user.email,
      resetUrl,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const newPasswordHash = await this.hasher.hash(newPassword);

    // 1. Supabase Access Token (JWT) ise Supabase üzerinden güncelle ve yerel şifreyi eşitle
    if (token.startsWith('ey') && this.config?.supabaseUrl && this.config?.supabaseAnonKey) {
      try {
        const response = await fetch(`${this.config.supabaseUrl}/auth/v1/user`, {
          method: 'PUT',
          headers: {
            apikey: this.config.supabaseAnonKey,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: newPassword }),
        });

        if (response.ok) {
          const data = (await response.json()) as { email?: string };
          if (data.email) {
            const user = await this.users.findByEmail(data.email);
            if (user) {
              await this.users.updatePassword(user.id, newPasswordHash);
              await this.resetTokens.invalidateAllForUser(user.id);
            }
          }
          return;
        }
      } catch {
        // Yerel belirteç kontrolüne devam et
      }
    }

    // 2. Kendi yerel token'ımız ile doğrulama
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetRecord = await this.resetTokens.findValidToken(tokenHash, new Date());

    if (!resetRecord) {
      throw badRequest('Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.');
    }

    await this.users.updatePassword(resetRecord.userId, newPasswordHash);
    await this.resetTokens.markAsUsed(resetRecord.id, new Date());
    await this.resetTokens.invalidateAllForUser(resetRecord.userId);
  }

  private issue(user: UserRecord): AuthResponse {
    return { token: this.tokens.sign({ sub: user.id }), user: toPublicUser(user) };
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= this.hasher.hash('timing-safe-dummy-password');
    return this.dummyHash;
  }
}
