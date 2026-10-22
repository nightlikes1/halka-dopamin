// /habits uç noktaları (oturum gerekli)
import type { FastifyInstance } from 'fastify';
import type { Clock } from '../../core/dates.js';
import { conflict, notFound } from '../../core/errors.js';
import type { HabitRepository } from './habit.repository.js';
import { createHabitBodySchema, habitIdParamsSchema } from './habits.schemas.js';

interface HabitRoutesOptions {
  readonly habits: HabitRepository;
  readonly clock: Clock;
}

export async function habitRoutes(
  app: FastifyInstance,
  { habits, clock }: HabitRoutesOptions,
): Promise<void> {
  app.addHook('preHandler', app.authenticate);

  app.get('/habits', async (request) => ({ habits: await habits.listActive(request.user.sub) }));

  app.post('/habits', async (request, reply) => {
    const input = createHabitBodySchema.parse(request.body);
    // Aynı ad (büyük/küçük harf farkı gözetmeden) aktif alışkanlıklarda tekrar edemez
    const key = input.title.trim().toLocaleLowerCase('tr');
    const existing = await habits.listActive(request.user.sub);
    if (existing.some((habit) => habit.title.trim().toLocaleLowerCase('tr') === key)) {
      throw conflict('Bu adla bir alışkanlık zaten var.');
    }
    return reply.status(201).send({ habit: await habits.create(request.user.sub, input) });
  });

  // Silme yerine arşivleme: geçmiş check-in cevapları korunur
  app.delete('/habits/:id', async (request, reply) => {
    const { id } = habitIdParamsSchema.parse(request.params);
    if (!(await habits.archive(request.user.sub, id, clock.now()))) {
      throw notFound('Alışkanlık bulunamadı.');
    }
    return reply.status(204).send();
  });
}
