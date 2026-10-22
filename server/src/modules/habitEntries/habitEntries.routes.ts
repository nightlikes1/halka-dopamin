// /habit-entries uç noktaları (oturum gerekli): gün içinde tek alışkanlığı işaretle / geri al
import type { FastifyInstance } from 'fastify';
import { addDays, dateRangeQuerySchema, localTodayBounds, type Clock } from '../../core/dates.js';
import { badRequest, notFound } from '../../core/errors.js';
import { STATUSES_BY_KIND } from '../checkins/checkins.schemas.js';
import type { HabitRepository } from '../habits/habit.repository.js';
import type { HabitEntryRepository } from './habitEntry.repository.js';
import { habitEntryParamsSchema, saveHabitEntryBodySchema } from './habitEntries.schemas.js';

interface HabitEntryRoutesOptions {
  readonly entries: HabitEntryRepository;
  readonly habits: HabitRepository;
  readonly clock: Clock;
}

export async function habitEntryRoutes(
  app: FastifyInstance,
  { entries, habits, clock }: HabitEntryRoutesOptions,
): Promise<void> {
  app.addHook('preHandler', app.authenticate);

  // Check-in ile aynı pencere: bugün ve dün (saat dilimi toleranslı)
  const assertEditable = (date: string) => {
    const { earliest, latest } = localTodayBounds(clock.now());
    if (date < addDays(earliest, -1) || date > latest) {
      throw badRequest('Alışkanlık yalnızca bugün ve dün için işaretlenebilir.');
    }
  };

  app.get('/habit-entries', async (request) => {
    const { from, to } = dateRangeQuerySchema.parse(request.query);
    return { entries: await entries.listRange(request.user.sub, from, to) };
  });

  app.put('/habit-entries/:date/:habitId', async (request) => {
    const { date, habitId } = habitEntryParamsSchema.parse(request.params);
    const { status } = saveHabitEntryBodySchema.parse(request.body);
    assertEditable(date);
    const kind = (await habits.findKinds(request.user.sub, [habitId])).get(habitId);
    if (!kind) throw notFound('Alışkanlık bulunamadı.');
    if (!STATUSES_BY_KIND[kind].includes(status)) {
      throw badRequest('Alışkanlık türü ile cevap uyumsuz.');
    }
    return { entry: await entries.upsert(habitId, date, status) };
  });

  app.delete('/habit-entries/:date/:habitId', async (request, reply) => {
    const { date, habitId } = habitEntryParamsSchema.parse(request.params);
    assertEditable(date);
    if (!(await entries.remove(request.user.sub, habitId, date))) throw notFound();
    return reply.status(204).send();
  });
}
