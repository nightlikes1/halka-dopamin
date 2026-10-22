// Ana hedefin tamamlanma durumunu değiştirir
import { ok, type AsyncResult } from '@core/result/Result';
import type { BigOne } from '@domain/entities/BigOne';
import type { IBigOneRepository } from '@domain/repositories/IBigOneRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class ToggleBigOneUseCase {
  constructor(private readonly repository: IBigOneRepository) {}

  execute(): AsyncResult<BigOne> {
    return updateEntity(this.repository, (bigOne) =>
      ok({ ...bigOne, isCompleted: !bigOne.isCompleted }),
    );
  }
}
