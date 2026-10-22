// /checkins uç noktaları (oturum gerekli)
import type { FastifyInstance } from 'fastify';
import { dateParamsSchema, dateRangeQuerySchema } from '../../core/dates.js';
import type { CheckInRepository } from './checkin.repository.js';
import type { CheckInService } from './checkin.service.js';
import { saveCheckInBodySchema } from './checkins.schemas.js';

interface CheckInRoutesOptions {
  readonly checkIns: CheckInRepository;
  readonly service: CheckInService;
}

export async function checkInRoutes(
  app: FastifyInstance,
  { checkIns, service }: CheckInRoutesOptions,
): Promise<void> {
  app.addHook('preHandler', app.authenticate);

  app.get('/checkins', async (request) => {
    const { from, to } = dateRangeQuerySchema.parse(request.query);
    return { checkIns: await checkIns.listRange(request.user.sub, from, to) };
  });

  app.get('/checkins/:date', async (request) => {
    const { date } = dateParamsSchema.parse(request.params);
    return { checkIn: await checkIns.get(request.user.sub, date) };
  });

  // Aynı gün tekrar gönderilirse günceller (düzenleme modu)
  app.put('/checkins/:date', async (request) => {
    const { date } = dateParamsSchema.parse(request.params);
    const input = saveCheckInBodySchema.parse(request.body);
    return { checkIn: await service.save(request.user.sub, date, input) };
  });
}
