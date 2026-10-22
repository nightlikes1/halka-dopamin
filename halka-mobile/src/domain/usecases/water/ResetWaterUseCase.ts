// Günlük su sayacını sıfırlar
import { ok, type AsyncResult } from '@core/result/Result';
import type { Water } from '@domain/entities/Water';
import type { IWaterRepository } from '@domain/repositories/IWaterRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class ResetWaterUseCase {
  constructor(private readonly repository: IWaterRepository) {}

  execute(): AsyncResult<Water> {
    return updateEntity(this.repository, (water) => ok({ ...water, current: 0 }));
  }
}
