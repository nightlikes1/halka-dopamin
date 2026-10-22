// Oturum use case testleri (gerçek SecureSessionStorage + bellek içi güvenli depo)
import { AuthFailure, NetworkFailure } from '@core/errors/Failure';
import { err, ok, type AsyncResult } from '@core/result/Result';
import {
  SecureSessionStorage,
  type SecureKeyValueStore,
} from '@features/auth/data/SecureSessionStorage';
import type {
  AuthSession,
  AuthUser,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
} from '@features/auth/domain/entities';
import type { AuthRepository } from '@features/auth/domain/ports';
import { ForgotPasswordUseCase } from '@features/auth/domain/usecases/ForgotPasswordUseCase';
import { LoginUseCase } from '@features/auth/domain/usecases/LoginUseCase';
import { LogoutUseCase } from '@features/auth/domain/usecases/LogoutUseCase';
import { RegisterUseCase } from '@features/auth/domain/usecases/RegisterUseCase';
import { ResetPasswordUseCase } from '@features/auth/domain/usecases/ResetPasswordUseCase';
import { RestoreSessionUseCase } from '@features/auth/domain/usecases/RestoreSessionUseCase';

const USER: AuthUser = { id: 'u1', email: 'ada@ornek.com', displayName: 'Ada' };
const SESSION: AuthSession = { token: 'jwt-token', user: USER };

class MemorySecureStore implements SecureKeyValueStore {
  readonly data = new Map<string, string>();
  async getItemAsync(key: string) {
    return this.data.get(key) ?? null;
  }
  async setItemAsync(key: string, value: string) {
    this.data.set(key, value);
  }
  async deleteItemAsync(key: string) {
    this.data.delete(key);
  }
}

class FakeAuthRepository implements AuthRepository {
  lastLogin: LoginInput | null = null;
  lastForgotPassword: ForgotPasswordInput | null = null;
  lastResetPassword: ResetPasswordInput | null = null;
  currentUserResult: Awaited<AsyncResult<AuthUser>> = ok(USER);

  async login(input: LoginInput): AsyncResult<AuthSession> {
    this.lastLogin = input;
    return input.password === 'dogru-sifre'
      ? ok(SESSION)
      : err(new AuthFailure('E-posta veya şifre hatalı.'));
  }

  async register(input: LoginInput): AsyncResult<AuthSession> {
    this.lastLogin = input;
    return ok(SESSION);
  }

  async fetchCurrentUser(): AsyncResult<AuthUser> {
    return this.currentUserResult;
  }

  async forgotPassword(input: ForgotPasswordInput): AsyncResult<string> {
    this.lastForgotPassword = input;
    return ok('Sıfırlama bağlantısı gönderildi.');
  }

  async resetPassword(input: ResetPasswordInput): AsyncResult<string> {
    this.lastResetPassword = input;
    if (input.token === 'gecersiz') {
      return err(new AuthFailure('Geçersiz belirteç.'));
    }
    return ok('Şifre güncellendi.');
  }
}

describe('Oturum use caseleri', () => {
  let repository: FakeAuthRepository;
  let store: MemorySecureStore;
  let sessions: SecureSessionStorage;

  beforeEach(() => {
    repository = new FakeAuthRepository();
    store = new MemorySecureStore();
    sessions = new SecureSessionStorage(store);
  });

  it('giriş başarılıysa e-postayı normalleştirir ve oturumu güvenli depoya yazar', async () => {
    const result = await new LoginUseCase(repository, sessions).execute({
      email: '  Ada@Ornek.COM ',
      password: 'dogru-sifre',
    });

    expect(result).toEqual({ ok: true, value: SESSION });
    expect(repository.lastLogin?.email).toBe('ada@ornek.com');
    expect(sessions.peekToken()).toBe('jwt-token');
    expect(store.data.size).toBe(1);
  });

  it('hatalı girişte oturum saklanmaz ve sunucu mesajı döner', async () => {
    const result = await new LoginUseCase(repository, sessions).execute({
      email: 'ada@ornek.com',
      password: 'yanlis',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe('E-posta veya şifre hatalı.');
    expect(store.data.size).toBe(0);
  });

  it('kayıtta boş görünen adı göndermez', async () => {
    await new RegisterUseCase(repository, sessions).execute({
      email: 'ada@ornek.com',
      password: 'dogru-sifre',
      displayName: '   ',
    });

    expect(repository.lastLogin).not.toHaveProperty('displayName');
  });

  describe('RestoreSessionUseCase', () => {
    it('kayıtlı oturum yoksa null döner', async () => {
      const result = await new RestoreSessionUseCase(repository, sessions).execute();

      expect(result).toEqual({ ok: true, value: null });
    });

    it('sunucu doğrularsa kullanıcı bilgisini tazeler', async () => {
      await sessions.save(SESSION);
      repository.currentUserResult = ok({ ...USER, displayName: 'Ada Yeni' });

      const result = await new RestoreSessionUseCase(repository, sessions).execute();

      expect(result.ok && result.value?.user.displayName).toBe('Ada Yeni');
    });

    it('sunucu 401 dönerse oturumu siler', async () => {
      await sessions.save(SESSION);
      repository.currentUserResult = err(new AuthFailure('Oturum geçersiz.'));

      const result = await new RestoreSessionUseCase(repository, sessions).execute();

      expect(result).toEqual({ ok: true, value: null });
      expect(store.data.size).toBe(0);
      expect(sessions.peekToken()).toBeNull();
    });

    it('sunucuya ulaşılamazsa (çevrimdışı) kayıtlı oturumla devam eder', async () => {
      await sessions.save(SESSION);
      repository.currentUserResult = err(new NetworkFailure('Sunucuya ulaşılamadı.'));

      const result = await new RestoreSessionUseCase(repository, sessions).execute();

      expect(result).toEqual({ ok: true, value: SESSION });
      expect(sessions.peekToken()).toBe('jwt-token');
    });

    it('bozuk kayıtlı oturumu yok sayar', async () => {
      store.data.set('halka_auth_session', '{"token":');

      const result = await new RestoreSessionUseCase(repository, sessions).execute();

      expect(result.ok).toBe(false);
    });
  });

  it('çıkış oturumu siler', async () => {
    await sessions.save(SESSION);

    await new LogoutUseCase(sessions).execute();

    expect(store.data.size).toBe(0);
    expect(sessions.peekToken()).toBeNull();
  });

  describe('ForgotPasswordUseCase', () => {
    it('e-postayı kırpar ve küçük harfe çevirerek istek gönderir', async () => {
      const useCase = new ForgotPasswordUseCase(repository);
      const result = await useCase.execute({ email: '  Ada@Ornek.COM ' });

      expect(result).toEqual({ ok: true, value: 'Sıfırlama bağlantısı gönderildi.' });
      expect(repository.lastForgotPassword?.email).toBe('ada@ornek.com');
    });
  });

  describe('ResetPasswordUseCase', () => {
    it('geçerli token ve yeni şifreyle şifreyi günceller', async () => {
      const useCase = new ResetPasswordUseCase(repository);
      const result = await useCase.execute({ token: 'gecerli-token', password: 'yeni-sifre-123' });

      expect(result).toEqual({ ok: true, value: 'Şifre güncellendi.' });
      expect(repository.lastResetPassword).toEqual({
        token: 'gecerli-token',
        password: 'yeni-sifre-123',
      });
    });

    it('geçersiz token durumunda hata döner', async () => {
      const useCase = new ResetPasswordUseCase(repository);
      const result = await useCase.execute({ token: 'gecersiz', password: 'yeni-sifre-123' });

      expect(result.ok).toBe(false);
    });
  });
});
