// /day-notes uç noktaları (oturum gerekli)
import type { FastifyInstance } from 'fastify';
import {
  dateParamsSchema,
  dateRangeQuerySchema,
  localTodayBounds,
  type Clock,
} from '../../core/dates.js';
import { badRequest, notFound } from '../../core/errors.js';
import type { DayNoteRepository } from './dayNote.repository.js';
import { saveDayNoteBodySchema } from './dayNotes.schemas.js';

interface DayNoteRoutesOptions {
  readonly notes: DayNoteRepository;
  readonly clock: Clock;
}

export async function dayNoteRoutes(
  app: FastifyInstance,
  { notes, clock }: DayNoteRoutesOptions,
): Promise<void> {
  app.addHook('preHandler', app.authenticate);

  app.get('/day-notes', async (request) => {
    const { from, to } = dateRangeQuerySchema.parse(request.query);
    return { notes: await notes.listRange(request.user.sub, from, to) };
  });

  app.put('/day-notes/:date', async (request) => {
    const { date } = dateParamsSchema.parse(request.params);
    const { text } = saveDayNoteBodySchema.parse(request.body);
    if (date > localTodayBounds(clock.now()).latest) {
      throw badRequest('Henüz gelmemiş bir güne not yazılamaz.');
    }
    return { note: await notes.upsert(request.user.sub, date, text) };
  });

  app.delete('/day-notes/:date', async (request, reply) => {
    const { date } = dateParamsSchema.parse(request.params);
    if (!(await notes.delete(request.user.sub, date))) throw notFound('Not bulunamadı.');
    return reply.status(204).send();
  });
}
