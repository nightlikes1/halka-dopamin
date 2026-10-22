// Ortam değişkeni doğrulama testleri
import { describe, expect, it } from 'vitest';
import { ConfigError, loadConfig } from './env.js';

const validEnv = {
  DATABASE_URL: 'postgresql://postgres:sifre@localhost:5432/halka',
  JWT_SECRET: 'x'.repeat(32),
};

describe('loadConfig', () => {
  it('varsayılanları uygular', () => {
    expect(loadConfig(validEnv)).toMatchObject({
      host: '0.0.0.0',
      port: 3000,
      jwtExpiresIn: '30d',
      isProduction: false,
    });
  });

  it('şifre yer tutucusu değiştirilmemişse anlaşılır hata verir', () => {
    const env = { ...validEnv, DATABASE_URL: 'postgresql://postgres:SIFRENI_YAZ@localhost/halka' };

    expect(() => loadConfig(env)).toThrow(ConfigError);
    expect(() => loadConfig(env)).toThrow(/SIFRENI_YAZ/);
  });

  it('kısa JWT anahtarını reddeder', () => {
    expect(() => loadConfig({ ...validEnv, JWT_SECRET: 'kisa' })).toThrow(/32 karakter/);
  });
});
