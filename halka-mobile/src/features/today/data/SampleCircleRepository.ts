// Örnek Çember: davet ve sunucu tarafı gelene kadar Bugün ekranındaki Çember şeridi bu veriyle çalışır
import { ok, type AsyncResult } from '@core/result/Result';
import type { Circle } from '@features/today/domain/entities';
import type { CircleRepository } from '@features/today/domain/ports';

export const SAMPLE_CIRCLE: Circle = {
  name: 'Çemberin',
  members: [
    { id: 'sample-ece', name: 'Ece', status: 'balanced' },
    { id: 'sample-mert', name: 'Mert', status: 'struggling', struggleDays: 3 },
    { id: 'sample-deniz', name: 'Deniz', status: 'quiet' },
  ],
};

export class SampleCircleRepository implements CircleRepository {
  async get(): AsyncResult<Circle | null> {
    return ok(SAMPLE_CIRCLE);
  }
}
