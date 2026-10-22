// Sağlık kontrolü: mobil uygulama sunucuya ulaşılabildiğini buradan anlar
import type { FastifyInstance } from 'fastify';

interface HealthRoutesOptions {
  readonly checkDatabase: () => Promise<boolean>;
}

export async function healthRoutes(
  app: FastifyInstance,
  { checkDatabase }: HealthRoutesOptions,
): Promise<void> {
  app.get('/health', async (_request, reply) => {
    const databaseUp = await checkDatabase();
    return reply
      .status(databaseUp ? 200 : 503)
      .send({ status: databaseUp ? 'ok' : 'degraded', database: databaseUp ? 'up' : 'down' });
  });
}
