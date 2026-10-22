// Su tüketimine miktar ekler
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type AsyncResult } from '@core/result/Result';
import { WATER_MAX_SINGLE_AMOUNT, type Water } from '@domain/entities/Water';
import type { IWaterRepository } from '@domain/repositories/IWaterRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class AddWaterUseCase {
  constructor(private readonly repository: IWaterRepository) {}

  async execute(amountMl: number): AsyncResult<Water> {
    if (!Number.isFinite(amountMl) || amountMl <= 0 || amountMl > WATER_MAX_SINGLE_AMOUNT) {
      return err(new ValidationFailure('Geçersiz su miktarı.'));
    }
    return updateEntity(this.repository, (water) =>
      ok({ ...water, current: water.current + amountMl }),
    );
  }
}
