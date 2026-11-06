// Kaba kuvvet ve kötüye kullanım sınırları: giriş, kayıt, şifremi unuttum, sıfırlama
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AttemptLimiter } from '../src/modules/auth/attemptLimiter.js';
import { createTestApp, registerAndAuth, type TestContext } from './fakes.js';

const EMAIL = 'ada@ornek.com';
const PASSWORD = 'dogru-sifre-123';

describe('İstek sınırları', () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
    vi.restoreAllMocks();
  });

  const start = async (options: Parameters<typeof createTestApp>[0] = {}): Promise<TestContext> => {
    const context = await createTestApp(options);
    app = context.app;
    await context.app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: EMAIL, password: PASSWORD },
    });
    return context;
  };

  const current = (): FastifyInstance => {
    if (!app) throw new Error('uygulama başlatılmadı');
    return app;
  };

  const login = (password: string, email = EMAIL, ip?: string) =>
    current().inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email, password },
      headers: ip ? { 'cf-connecting-ip': ip } : {},
    });

  const failLogins = async (times: number, email = EMAIL, ip?: string) => {
    for (let i = 0; i < times; i++) {
      expect((await login('yanlis-sifre', email, ip)).statusCode).toBe(401);
    }
  };

  describe('giriş', () => {
    it('5 başarısız denemeden sonra doğru şifreyi de reddeder, Türkçe mesaj ve bekleme süresi döner', async () => {
      await start();
      await failLogins(5);

      const blocked = await login(PASSWORD);
      expect(blocked.statusCode).toBe(429);
      expect(blocked.json()).toMatchObject({ error: { code: 'RATE_LIMITED' } });
      expect(blocked.json<{ error: { message: string } }>().error.message).toMatch(
        /\d+ (saniye|dakika) sonra tekrar dene/,
      );
      expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
    });

    it('başarılı girişleri başarısız saymaz', async () => {
      await start();
      for (let i = 0; i < 8; i++) {
        expect((await login(PASSWORD)).statusCode).toBe(200);
      }
    });

    it('süre dolunca tekrar izin verir', async () => {
      let now = new Date('2026-11-06T12:00:00.000Z').getTime();
      await start({ clock: { now: () => new Date(now) } });
      await failLogins(5);
      expect((await login(PASSWORD)).statusCode).toBe(429);

      now += 61_000;
      expect((await login(PASSWORD)).statusCode).toBe(200);
    });

    it('saldırgan kendi hesabına girerek IP sayacını sıfırlayamaz', async () => {
      await start();
      await registerAndAuth(current(), 'saldirgan@ornek.com');
      await failLogins(4);
      expect((await login(PASSWORD, 'saldirgan@ornek.com')).statusCode).toBe(401);
      expect((await login(PASSWORD)).statusCode).toBe(429);
    });

    it('aynı anda gönderilen denemeler sınırı aşamaz', async () => {
      await start();
      const responses = await Promise.all(Array.from({ length: 12 }, () => login('yanlis-sifre')));
      const rejected = responses.filter((response) => response.statusCode === 401);
      expect(rejected).toHaveLength(5);
    });

    it('veritabanı kesintisini başarısız deneme saymaz', async () => {
      const { users } = await start();
      const outage = vi.spyOn(users, 'findByEmail').mockRejectedValue(new Error('bağlantı yok'));
      for (let i = 0; i < 8; i++) {
        expect((await login(PASSWORD)).statusCode).toBe(500);
      }
      outage.mockRestore();
      expect((await login(PASSWORD)).statusCode).toBe(200);
    });
  });

  describe('üretimde gerçek istemci adresi', () => {
    const production = { config: { isProduction: true } };

    it('farklı adresler birbirini kilitlemez', async () => {
      await start(production);
      await failLogins(5, 'yok@ornek.com', '203.0.113.1');
      expect((await login(PASSWORD, EMAIL, '203.0.113.1')).statusCode).toBe(429);
      expect((await login(PASSWORD, EMAIL, '203.0.113.2')).statusCode).toBe(200);
    });

    it('IP değiştirerek aynı hesaba saldırı e-posta sayacına takılır', async () => {
      await start(production);
      for (let i = 1; i <= 5; i++) {
        expect((await login('yanlis-sifre', EMAIL, `203.0.113.${i}`)).statusCode).toBe(401);
      }
      expect((await login('yanlis-sifre', EMAIL, '203.0.113.9')).statusCode).toBe(429);
    });

    it('başarılı giriş e-posta sayacını temizler', async () => {
      await start(production);
      await failLogins(4, EMAIL, '203.0.113.1');
      expect((await login(PASSWORD, EMAIL, '203.0.113.2')).statusCode).toBe(200);
      await failLogins(5, EMAIL, '203.0.113.3');
    });

    it('aynı IPv6 /64 bloğu tek adres sayılır', async () => {
      await start(production);
      for (let i = 1; i <= 5; i++) {
        expect(
          (await login('yanlis-sifre', `k${i}@ornek.com`, `2001:db8:1:1::${i}`)).statusCode,
        ).toBe(401);
      }
      expect((await login(PASSWORD, EMAIL, '2001:db8:1:1::99')).statusCode).toBe(429);
      expect((await login(PASSWORD, EMAIL, '2001:db8:1:2::1')).statusCode).toBe(200);
    });

    it('geliştirmede başlık okunmaz: sahte adresle sınır aşılamaz', async () => {
      await start();
      for (let i = 1; i <= 5; i++) {
        expect((await login('yanlis-sifre', `k${i}@ornek.com`, `203.0.113.${i}`)).statusCode).toBe(
          401,
        );
      }
      expect((await login(PASSWORD, EMAIL, '203.0.113.9')).statusCode).toBe(429);
    });
  });

  describe('şifremi unuttum', () => {
    const forgot = (email: string, ip?: string) =>
      current().inject({
        method: 'POST',
        url: '/auth/forgot-password',
        payload: { email },
        headers: ip ? { 'cf-connecting-ip': ip } : {},
      });

    it('saatte 3 isteğe izin verir, 4. isteği posta göndermeden reddeder', async () => {
      const { emailService } = await start();
      for (let i = 0; i < 3; i++) {
        expect((await forgot(EMAIL)).statusCode).toBe(200);
      }
      const blocked = await forgot(EMAIL);
      expect(blocked.statusCode).toBe(429);
      expect(blocked.json()).toMatchObject({ error: { code: 'RATE_LIMITED' } });
      expect(blocked.json<{ error: { message: string } }>().error.message).toMatch(/dakika sonra/);
      expect(emailService.sentEmails).toHaveLength(3);
    });

    it('IP değiştirerek aynı kişiye posta yağdırılamaz', async () => {
      const { emailService } = await start({ config: { isProduction: true } });
      for (let i = 1; i <= 3; i++) {
        expect((await forgot(EMAIL, `203.0.113.${i}`)).statusCode).toBe(200);
      }
      expect((await forgot(EMAIL, '203.0.113.9')).statusCode).toBe(429);
      expect(emailService.sentEmails).toHaveLength(3);
    });
  });

  it('kayıt: IP başına saatte 10 istek', async () => {
    const { app: instance } = await createTestApp();
    app = instance;
    const register = () =>
      instance.inject({ method: 'POST', url: '/auth/register', payload: { email: 'gecersiz' } });
    for (let i = 0; i < 10; i++) {
      expect((await register()).statusCode).toBe(400);
    }
    const blocked = await register();
    expect(blocked.statusCode).toBe(429);
    expect(blocked.json()).toMatchObject({ error: { code: 'RATE_LIMITED' } });
    expect(blocked.headers['retry-after']).toBeDefined();
  });

  it('sıfırlama: IP başına saatte 10 istek', async () => {
    const { app: instance } = await createTestApp();
    app = instance;
    const reset = () =>
      instance.inject({ method: 'POST', url: '/auth/reset-password', payload: {} });
    for (let i = 0; i < 10; i++) {
      expect((await reset()).statusCode).toBe(400);
    }
    expect((await reset()).statusCode).toBe(429);
  });

  it('sınır verilmeyen uç noktalar etkilenmez', async () => {
    const { app: instance } = await createTestApp();
    app = instance;
    for (let i = 0; i < 40; i++) {
      expect((await instance.inject({ url: '/health' })).statusCode).toBe(200);
    }
  });
});

describe('AttemptLimiter', () => {
  it('izlenen anahtar sayısı sınırı aşınca en eskisini bırakır, süresi dolanları temizler', () => {
    let now = 0;
    const limiter = new AttemptLimiter(1, 1000, { now: () => new Date(now) });

    for (let i = 0; i < 10_000; i++) limiter.hit([`k${i}`]);
    expect(() => limiter.assertAllowed(['k0'])).toThrow();

    limiter.hit(['yeni']);
    // k0 çıkarıldı, sonraki anahtarlar duruyor
    expect(() => limiter.assertAllowed(['k0'])).not.toThrow();
    expect(() => limiter.assertAllowed(['k1'])).toThrow();
    expect(() => limiter.assertAllowed(['yeni'])).toThrow();

    now = 2000;
    expect(() => limiter.assertAllowed(['k1', 'yeni'])).not.toThrow();
  });
});
