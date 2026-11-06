// /auth/* ve /me uç noktaları
import type { FastifyInstance } from 'fastify';
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
} from './auth.schemas.js';
import type { AuthService } from './auth.service.js';
import { AttemptLimiter } from './attemptLimiter.js';
import type { Clock } from '../../core/dates.js';
import { AppError } from '../../core/errors.js';
import { clientIp } from '../../plugins/rateLimit.js';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

// IP başına tüm istekler (başarılı olanlar dahil): bcrypt pahalı olduğu için işlemciyi de korur
const REQUEST_LIMITS = {
  login: { max: 30, timeWindow: MINUTE_MS },
  register: { max: 10, timeWindow: HOUR_MS },
  forgotPassword: { max: 3, timeWindow: HOUR_MS },
  resetPassword: { max: 10, timeWindow: HOUR_MS },
};

const MAX_FAILED_LOGINS_PER_MINUTE = 5;
const MAX_RESET_MAILS_PER_HOUR = 3;

interface AuthRoutesOptions {
  readonly authService: AuthService;
  readonly appUrl: string;
  readonly isProduction: boolean;
  readonly clock: Clock;
}

export async function authRoutes(
  app: FastifyInstance,
  { authService, appUrl, isProduction, clock }: AuthRoutesOptions,
): Promise<void> {
  const failedLogins = new AttemptLimiter(MAX_FAILED_LOGINS_PER_MINUTE, MINUTE_MS, clock);
  const resetMails = new AttemptLimiter(MAX_RESET_MAILS_PER_HOUR, HOUR_MS, clock);

  app.post(
    '/auth/register',
    { config: { rateLimit: REQUEST_LIMITS.register } },
    async (request, reply) => {
      const input = registerBodySchema.parse(request.body);
      return reply.status(201).send(await authService.register(input));
    },
  );

  app.post('/auth/login', { config: { rateLimit: REQUEST_LIMITS.login } }, async (request) => {
    const input = loginBodySchema.parse(request.body);
    // E-posta anahtarı: IP değiştirerek aynı hesaba saldırmayı da keser
    const ipKey = `ip:${clientIp(request, isProduction)}`;
    const emailKey = `email:${input.email}`;
    failedLogins.assertAllowed([ipKey, emailKey]);
    // Şifre kontrolünden önce sayılır: aynı anda gönderilen istekler sınırı aşamaz
    failedLogins.hit([ipKey, emailKey]);
    try {
      const response = await authService.login(input);
      // IP sayacı sıfırlanmaz: saldırgan kendi hesabına girerek sayacını temizleyemesin
      failedLogins.undo(ipKey);
      failedLogins.clear(emailKey);
      return response;
    } catch (error) {
      // Yalnızca yanlış şifre sayılır; veritabanı kesintisinde kullanıcılar kilitlenmez
      if (!(error instanceof AppError && error.statusCode === 401)) {
        failedLogins.undo(ipKey);
        failedLogins.undo(emailKey);
      }
      throw error;
    }
  });

  app.post(
    '/auth/forgot-password',
    { config: { rateLimit: REQUEST_LIMITS.forgotPassword } },
    async (request, reply) => {
      const input = forgotPasswordBodySchema.parse(request.body);
      // IP değiştirerek birinin posta kutusunu doldurmayı keser
      const emailKey = `email:${input.email}`;
      resetMails.assertAllowed([emailKey]);
      resetMails.hit([emailKey]);
      // Arka planda: hesap varsa posta gönderildiği için yanıt süresi hesabı ele vermesin.
      // Posta hatası da aynı sebeple kullanıcıya yansımaz, yalnızca günlüğe yazılır
      void authService.forgotPassword(input.email, appUrl).catch((error: unknown) => {
        request.log.error({ err: error }, 'Şifre sıfırlama e-postası gönderilemedi');
      });
      return reply.status(200).send({
        message: 'Bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderildi.',
      });
    },
  );

  app.post(
    '/auth/reset-password',
    { config: { rateLimit: REQUEST_LIMITS.resetPassword } },
    async (request, reply) => {
      const input = resetPasswordBodySchema.parse(request.body);
      await authService.resetPassword(input.token, input.password);
      return reply.status(200).send({
        message: 'Şifreniz başarıyla güncellendi.',
      });
    },
  );

  // E-postadaki link doğrudan API'ye tıklandığında web önizlemesine/uygulamaya yönlendirir
  app.get('/auth/reset-password', async (request, reply) => {
    const query = (request.query ?? {}) as { token?: string };
    const token = typeof query.token === 'string' ? query.token : '';
    const cleanAppUrl = appUrl.replace(/\/$/, '');
    const redirectUrl = token
      ? `${cleanAppUrl}/reset-password?token=${encodeURIComponent(token)}`
      : `${cleanAppUrl}/reset-password`;
    return reply.redirect(redirectUrl, 302);
  });

  app.get('/me', { preHandler: app.authenticate }, async (request) => {
    return { user: await authService.me(request.user.sub) };
  });
}
