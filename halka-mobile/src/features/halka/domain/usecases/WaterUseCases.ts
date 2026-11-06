// Su takibi
import { ValidationFailure } from '@core/errors/Failure';
import { type AsyncResult, err, ok } from '@core/result/Result';
import { type Water, WATER_MAX_SINGLE_AMOUNT } from '@features/halka/domain/entities/Water';
import type { IEntityRepository } from '@features/halka/domain/ports';
import { updateEntity } from '@features/halka/domain/usecases/updateEntity';

// Su tüketimine miktar ekler
export class AddWaterUseCase {
  constructor(private readonly repository: IEntityRepository<Water>) {}

  async execute(amountMl: number): AsyncResult<Water> {
    if (!Number.isFinite(amountMl) || amountMl <= 0 || amountMl > WATER_MAX_SINGLE_AMOUNT) {
      return err(new ValidationFailure('Geçersiz su miktarı.'));
    }
    return updateEntity(this.repository, (water) =>
      ok({ ...water, current: water.current + amountMl }),
    );
  }
}

// Günlük su sayacını sıfırlar
export class ResetWaterUseCase {
  constructor(private readonly repository: IEntityRepository<Water>) {}

  execute(): AsyncResult<Water> {
    return updateEntity(this.repository, (water) => ok({ ...water, current: 0 }));
  }
}
