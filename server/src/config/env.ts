// Ortam değişkenlerini doğrular ve tipli yapılandırmaya çevirir
import { z } from 'zod';

const PASSWORD_PLACEHOLDER = 'SIFRENI_YAZ';

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL tanımlı değil.')
    .refine((value) => value.startsWith('postgres'), 'DATABASE_URL bir PostgreSQL adresi olmalı.')
    .refine(
      (value) => !value.includes(PASSWORD_PLACEHOLDER),
      'server/.env içindeki DATABASE_URL değerinde SIFRENI_YAZ yerine PostgreSQL şifreni yaz.',
    ),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET en az 32 karakter olmalı.'),
  JWT_EXPIRES_IN: z.string().default('30d'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().default('http://localhost:8080'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('Halka <noreply@halka.app>'),
  SMTP_SECURE: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
});

export interface AppConfig {
  readonly databaseUrl: string;
  readonly jwtSecret: string;
  readonly jwtExpiresIn: string;
  readonly host: string;
  readonly port: number;
  readonly isProduction: boolean;
  readonly appUrl: string;
  readonly smtpHost?: string;
  readonly smtpPort: number;
  readonly smtpUser?: string;
  readonly smtpPass?: string;
  readonly smtpFrom: string;
  readonly smtpSecure: boolean;
  readonly supabaseUrl?: string;
  readonly supabaseAnonKey?: string;
}

export class ConfigError extends Error {}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `- ${issue.message}`).join('\n');
    throw new ConfigError(`Ortam değişkenleri geçersiz:\n${details}`);
  }
  const value = parsed.data;
  return {
    databaseUrl: value.DATABASE_URL,
    jwtSecret: value.JWT_SECRET,
    jwtExpiresIn: value.JWT_EXPIRES_IN,
    host: value.HOST,
    port: value.PORT,
    isProduction: value.NODE_ENV === 'production',
    appUrl: value.APP_URL,
    smtpHost: value.SMTP_HOST,
    smtpPort: value.SMTP_PORT,
    smtpUser: value.SMTP_USER,
    smtpPass: value.SMTP_PASS,
    smtpFrom: value.SMTP_FROM,
    smtpSecure: value.SMTP_SECURE,
    supabaseUrl: value.SUPABASE_URL,
    supabaseAnonKey: value.SUPABASE_ANON_KEY,
  };
}
