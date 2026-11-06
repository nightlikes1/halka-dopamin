// İstek sınırı: yalnızca route'ta `config.rateLimit` verilen uç noktalarda çalışır (sayaçlar bellekte)
import fastifyRateLimit, { normalizeIP } from '@fastify/rate-limit';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AppConfig } from '../config/env.js';
import { tooManyRequests } from '../core/errors.js';

// Üretimde istek Cloudflare -> Nginx -> Docker yoluyla gelir; request.ip herkes için Docker ağ geçididir.
// Gerçek adres Cloudflare'in başlığındadır. Geliştirmede proxy yok: başlık sahte olabileceğinden okunmaz.
export function clientIp(request: FastifyRequest, isProduction: boolean): string {
  const header = isProduction ? request.headers['cf-connecting-ip'] : undefined;
  // IPv6'da tek kişi /64 bloğunun tamamını kullanabilir: blok tek adres sayılır
  return normalizeIP(typeof header === 'string' ? header : request.ip);
}

export async function registerRateLimit(app: FastifyInstance, config: AppConfig): Promise<void> {
  await app.register(fastifyRateLimit, {
    global: false,
    keyGenerator: (request) => clientIp(request, config.isProduction),
    errorResponseBuilder: (_request, context) => tooManyRequests(Math.ceil(context.ttl / 1000)),
  });
}
