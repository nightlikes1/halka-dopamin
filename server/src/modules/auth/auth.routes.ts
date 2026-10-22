// /auth/* ve /me uç noktaları
import type { FastifyInstance } from 'fastify';
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
} from './auth.schemas.js';
import type { AuthService } from './auth.service.js';

interface AuthRoutesOptions {
  readonly authService: AuthService;
  readonly appUrl: string;
}

export async function authRoutes(
  app: FastifyInstance,
  { authService, appUrl }: AuthRoutesOptions,
): Promise<void> {
  app.post('/auth/register', async (request, reply) => {
    const input = registerBodySchema.parse(request.body);
    return reply.status(201).send(await authService.register(input));
  });

  app.post('/auth/login', async (request) => {
    const input = loginBodySchema.parse(request.body);
    return authService.login(input);
  });

  app.post('/auth/forgot-password', async (request, reply) => {
    const input = forgotPasswordBodySchema.parse(request.body);
    await authService.forgotPassword(input.email, appUrl);
    return reply.status(200).send({
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
    });
  });

  app.post('/auth/reset-password', async (request, reply) => {
    const input = resetPasswordBodySchema.parse(request.body);
    await authService.resetPassword(input.token, input.password);
    return reply.status(200).send({
      message: 'Şifreniz başarıyla güncellendi.',
    });
  });

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
