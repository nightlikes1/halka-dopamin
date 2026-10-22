// HTTP seviyesinde uçtan uca testler (veritabanı yerine bellek içi repository)
import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, type InMemoryUserRepository } from './fakes.js';

describe('API', () => {
  let app: FastifyInstance;
  let users: InMemoryUserRepository;
  let emailService: { sentEmails: { to: string; resetUrl: string }[] };
  let databaseUp: boolean;

  beforeEach(async () => {
    databaseUp = true;
    const ctx = await createTestApp({ checkDatabase: async () => databaseUp });
    app = ctx.app;
    users = ctx.users;
    emailService = ctx.emailService;
  });

  afterEach(async () => {
    await app.close();
  });

  const register = (body: Record<string, unknown>) =>
    app.inject({ method: 'POST', url: '/auth/register', payload: body });

  it('GET /health veritabanı durumunu döndürür', async () => {
    expect((await app.inject({ url: '/health' })).json()).toEqual({
      status: 'ok',
      database: 'up',
    });

    databaseUp = false;
    const response = await app.inject({ url: '/health' });
    expect(response.statusCode).toBe(503);
  });

  it('kayıt olur; e-postayı küçük harfe çevirir ve şifreyi hash olarak saklar', async () => {
    const response = await register({ email: ' Ada@Ornek.com ', password: 'gizli-sifre' });

    expect(response.statusCode).toBe(201);
    const body = response.json<{ token: string; user: { email: string } }>();
    expect(body.token).toEqual(expect.any(String));
    expect(body.user.email).toBe('ada@ornek.com');
    expect(body.user).not.toHaveProperty('passwordHash');

    const stored = await users.findByEmail('ada@ornek.com');
    expect(stored?.passwordHash).not.toBe('gizli-sifre');
  });

  it('aynı e-posta ile ikinci kayıt 409 döner', async () => {
    await register({ email: 'ada@ornek.com', password: 'gizli-sifre' });

    const response = await register({ email: 'ADA@ornek.com', password: 'baska-sifre' });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ error: { code: 'CONFLICT' } });
  });

  it('geçersiz gövdede alan bazlı 400 döner', async () => {
    const response = await register({ email: 'gecersiz', password: '123' });

    expect(response.statusCode).toBe(400);
    const body = response.json<{ error: { issues: { path: string }[] } }>();
    expect(body.error.issues.map((issue) => issue.path).sort()).toEqual(['email', 'password']);
  });

  it('doğru şifreyle giriş yapar, yanlışta 401 döner', async () => {
    await register({ email: 'ada@ornek.com', password: 'gizli-sifre' });

    const ok = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'ada@ornek.com', password: 'gizli-sifre' },
    });
    const wrong = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'ada@ornek.com', password: 'yanlis-sifre' },
    });
    const unknown = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'yok@ornek.com', password: 'gizli-sifre' },
    });

    expect(ok.statusCode).toBe(200);
    expect(wrong.statusCode).toBe(401);
    // Kayıtlı olmayan e-posta ile aynı mesaj: hangi e-postaların kayıtlı olduğu sızmaz
    expect(unknown.json()).toEqual(wrong.json());
  });

  it('GET /me token ile kullanıcıyı döndürür, tokensız 401 verir', async () => {
    const { token } = (await register({ email: 'ada@ornek.com', password: 'gizli-sifre' })).json<{
      token: string;
    }>();

    const withToken = await app.inject({
      url: '/me',
      headers: { authorization: `Bearer ${token}` },
    });
    const withoutToken = await app.inject({ url: '/me' });
    const badToken = await app.inject({
      url: '/me',
      headers: { authorization: 'Bearer bozuk.token.degeri' },
    });

    expect(withToken.statusCode).toBe(200);
    expect(withToken.json()).toMatchObject({ user: { email: 'ada@ornek.com' } });
    expect(withoutToken.statusCode).toBe(401);
    expect(badToken.statusCode).toBe(401);
  });

  it('geliştirmede tarayıcı önizlemesi için CORS başlığı döner', async () => {
    const response = await app.inject({
      url: '/health',
      headers: { origin: 'http://localhost:8081' },
    });
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:8081');
  });

  it('geliştirmede PUT/DELETE preflight isteklerine izin verir', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/habit-entries/2026-10-14/x',
      headers: {
        origin: 'http://localhost:8081',
        'access-control-request-method': 'PUT',
      },
    });
    expect(response.headers['access-control-allow-methods']).toContain('PUT');
    expect(response.headers['access-control-allow-methods']).toContain('DELETE');
  });

  it('bilinmeyen uç noktada standart 404 gövdesi döner', async () => {
    const response = await app.inject({ url: '/yok' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ error: { code: 'NOT_FOUND' } });
  });

  describe('Şifremi unuttum ve sıfırlama', () => {
    it('kayıtlı kullanıcı için sıfırlama e-postası gönderir ve link ile yeni şifre atanabilir', async () => {
      await register({ email: 'ada@ornek.com', password: 'eski-sifre-123' });

      // 1. Şifremi unuttum isteği
      const forgotRes = await app.inject({
        method: 'POST',
        url: '/auth/forgot-password',
        payload: { email: 'ada@ornek.com' },
      });
      expect(forgotRes.statusCode).toBe(200);

      // 2. E-postadaki bağlantıyı ve token'ı doğrula
      expect(emailService.sentEmails).toHaveLength(1);
      const email = emailService.sentEmails[0];
      expect(email).toBeDefined();
      if (!email) throw new Error('Email must be defined');

      expect(email.to).toBe('ada@ornek.com');
      expect(email.resetUrl).toContain('/reset-password?token=');

      const urlObj = new URL(email.resetUrl);
      const token = urlObj.searchParams.get('token');
      expect(token).toBeTruthy();

      // 3. Yeni şifre belirle
      const resetRes = await app.inject({
        method: 'POST',
        url: '/auth/reset-password',
        payload: { token, password: 'yeni-guclu-sifre-456' },
      });
      expect(resetRes.statusCode).toBe(200);

      // 4. Eski şifre artık çalışmaz
      const oldLogin = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'ada@ornek.com', password: 'eski-sifre-123' },
      });
      expect(oldLogin.statusCode).toBe(401);

      // 5. Yeni şifre ile giriş başarılıdır
      const newLogin = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'ada@ornek.com', password: 'yeni-guclu-sifre-456' },
      });
      expect(newLogin.statusCode).toBe(200);

      // 6. Aynı token ikinci kez kullanılamaz
      const reuseRes = await app.inject({
        method: 'POST',
        url: '/auth/reset-password',
        payload: { token, password: 'ucuncu-sifre-789' },
      });
      expect(reuseRes.statusCode).toBe(400);
    });

    it('kayıtlı olmayan e-postada 404 döner ve e-posta göndermez', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/forgot-password',
        payload: { email: 'kayitsiz@ornek.com' },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({
        error: {
          code: 'NOT_FOUND',
          message: 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.',
        },
      });
      expect(emailService.sentEmails).toHaveLength(0);
    });

    it('geçersiz veya süresi dolmuş token 400 döner', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/reset-password',
        payload: { token: 'gecersiz-veya-uydurma-token', password: 'yeni-guclu-sifre' },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
    });

    it('kısa şifre ile sıfırlama 400 döner', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/reset-password',
        payload: { token: 'herhangi-bir-token', password: '123' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('GET /auth/reset-password web arayüzüne 302 yönlendirir', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/reset-password?token=test-token-123',
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('http://localhost:8080/reset-password?token=test-token-123');
    });
  });
});

