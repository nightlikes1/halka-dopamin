// API yanıtlarındaki güvenlik başlıkları: başarılı, hatalı ve sınıra takılan yanıtlarda da gelmeli
import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp } from './fakes.js';

describe('API güvenlik başlıkları', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    ({ app } = await createTestApp());
  });

  afterEach(async () => {
    await app.close();
  });

  const expectSecurityHeaders = (headers: Record<string, unknown>) => {
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(headers['content-security-policy']).toContain("default-src 'none'");
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['x-powered-by']).toBeUndefined();
    // HSTS'i Cloudflare ekler
    expect(headers['strict-transport-security']).toBeUndefined();
  };

  it('başarılı yanıtta', async () => {
    const response = await app.inject({ url: '/health' });
    expect(response.statusCode).toBe(200);
    expectSecurityHeaders(response.headers);
  });

  it('bilinmeyen uç noktada', async () => {
    const response = await app.inject({ url: '/yok' });
    expect(response.statusCode).toBe(404);
    expectSecurityHeaders(response.headers);
  });

  it('doğrulama hatasında', async () => {
    const response = await app.inject({ method: 'POST', url: '/auth/login', payload: {} });
    expect(response.statusCode).toBe(400);
    expectSecurityHeaders(response.headers);
  });

  it('sınıra takılan yanıtta', async () => {
    const reset = () => app.inject({ method: 'POST', url: '/auth/reset-password', payload: {} });
    for (let i = 0; i < 10; i++) await reset();
    const blocked = await reset();
    expect(blocked.statusCode).toBe(429);
    expectSecurityHeaders(blocked.headers);
  });

  it('e-posta bağlantısındaki yönlendirme çalışmaya devam eder', async () => {
    const response = await app.inject({ url: '/auth/reset-password?token=abc' });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toContain('/reset-password?token=abc');
  });
});
