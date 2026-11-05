// Giriş, kayıt, oturum ve şifre sıfırlama use case'leri
import { type AsyncResult, ok } from '@core/result/Result';
import type {
  AuthSession,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '@features/auth/domain/entities';
import type { AuthRepository, SessionStorage } from '@features/auth/domain/ports';

// E-posta ve şifreyle giriş yapar, oturumu cihazda saklar
export class LoginUseCase {
  constructor(
    private readonly repository: AuthRepository,
    private readonly sessions: SessionStorage,
  ) {}

  async execute(input: LoginInput): AsyncResult<AuthSession> {
    const result = await this.repository.login({
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });
    if (!result.ok) return result;

    const saved = await this.sessions.save(result.value);
    return saved.ok ? ok(result.value) : saved;
  }
}

// Yeni hesap oluşturur ve oturumu başlatır
export class RegisterUseCase {
  constructor(
    private readonly repository: AuthRepository,
    private readonly sessions: SessionStorage,
  ) {}

  async execute(input: RegisterInput): AsyncResult<AuthSession> {
    const displayName = input.displayName?.trim();
    const result = await this.repository.register({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      ...(displayName ? { displayName } : {}),
    });
    if (!result.ok) return result;

    const saved = await this.sessions.save(result.value);
    return saved.ok ? ok(result.value) : saved;
  }
}

// Açılışta kayıtlı oturumu geri yükler.
// Sunucuya ulaşılamazsa (çevrimdışı) son bilinen oturumla devam edilir;
// yalnızca sunucu oturumu açıkça reddederse (401) oturum silinir.
export class RestoreSessionUseCase {
  constructor(
    private readonly repository: AuthRepository,
    private readonly sessions: SessionStorage,
  ) {}

  async execute(): AsyncResult<AuthSession | null> {
    const stored = await this.sessions.load();
    if (!stored.ok) return stored;
    const session = stored.value;
    if (!session) return ok(null);

    const current = await this.repository.fetchCurrentUser();
    if (current.ok) {
      const refreshed: AuthSession = { ...session, user: current.value };
      await this.sessions.save(refreshed);
      return ok(refreshed);
    }

    if (current.error.kind === 'auth') {
      await this.sessions.clear();
      return ok(null);
    }

    // Ağ/sunucu hatası: kullanıcıyı dışarı atmadan önbellekteki oturumla devam et
    return ok(session);
  }
}

// Oturumu cihazdan siler
export class LogoutUseCase {
  constructor(private readonly sessions: SessionStorage) {}

  execute(): AsyncResult<void> {
    return this.sessions.clear();
  }
}

// Şifremi unuttum isteği gönderir
export class ForgotPasswordUseCase {
  constructor(private readonly repository: AuthRepository) {}

  execute(input: ForgotPasswordInput): AsyncResult<string> {
    return this.repository.forgotPassword({
      email: input.email.trim().toLowerCase(),
    });
  }
}

// Belirteç ve yeni şifreyle şifreyi sıfırlar
export class ResetPasswordUseCase {
  constructor(private readonly repository: AuthRepository) {}

  execute(input: ResetPasswordInput): AsyncResult<string> {
    return this.repository.resetPassword(input);
  }
}
