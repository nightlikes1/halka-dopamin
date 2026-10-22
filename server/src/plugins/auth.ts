// JWT kimlik doğrulama: token üretimi ve korumalı uç noktalar için `authenticate`
import fastifyJwt from '@fastify/jwt';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AppConfig } from '../config/env.js';
import { unauthorized } from '../core/errors.js';

export interface TokenPayload {
  readonly sub: string; // kullanıcı kimliği
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: TokenPayload;
    user: TokenPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
  }
}

// Kök uygulamaya doğrudan uygulanır; böylece dekorasyon tüm route'lara görünür
export async function registerAuth(app: FastifyInstance, config: AppConfig): Promise<void> {
  await app.register(fastifyJwt, {
    secret: config.jwtSecret,
    sign: { expiresIn: config.jwtExpiresIn },
  });

  app.decorate('authenticate', async (request: FastifyRequest) => {
    try {
      await request.jwtVerify();
    } catch {
      throw unauthorized();
    }
  });
}
