// /habits uç noktaları (oturum gerekli)
import type { FastifyInstance } from 'fastify';
import type { Clock } from '../../core/dates.js';
import { conflict, notFound } from '../../core/errors.js';
import type { HabitRepository } from './habit.repository.js';
import {
  createHabitBodySchema,
  habitIdParamsSchema,
  updateHabitBodySchema,
} from './habits.schemas.js';

// Aynı ad (büyük/küçük harf farkı gözetmeden) aktif alışkanlıklarda tekrar edemez
const titleKey = (title: string) => title.trim().toLocaleLowerCase('tr');
const DUPLICATE_TITLE = 'Bu adla bir alışkanlık zaten var.';

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
    const existing = await habits.listActive(request.user.sub);
    if (existing.some((habit) => titleKey(habit.title) === titleKey(input.title))) {
      throw conflict(DUPLICATE_TITLE);
    }
    return reply.status(201).send({ habit: await habits.create(request.user.sub, input) });
  });

  app.put('/habits/:id', async (request) => {
    const { id } = habitIdParamsSchema.parse(request.params);
    const input = updateHabitBodySchema.parse(request.body);
    const existing = await habits.listActive(request.user.sub);
    const taken = existing.some(
      (habit) => habit.id !== id && titleKey(habit.title) === titleKey(input.title),
    );
    if (taken) throw conflict(DUPLICATE_TITLE);
    const habit = await habits.update(request.user.sub, id, input);
    if (!habit) throw notFound('Alışkanlık bulunamadı.');
    return { habit };
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
