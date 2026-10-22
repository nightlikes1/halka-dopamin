// Ana hedef metnini değiştirir; yeni hedef tamamlanmamış olarak başlar
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type AsyncResult } from '@core/result/Result';
import { BIG_ONE_GOAL_MAX_LENGTH, type BigOne } from '@domain/entities/BigOne';
import type { IBigOneRepository } from '@domain/repositories/IBigOneRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class UpdateBigOneGoalUseCase {
  constructor(private readonly repository: IBigOneRepository) {}

  async execute(goal: string): AsyncResult<BigOne> {
    const trimmed = goal.trim();
    if (trimmed.length === 0 || trimmed.length > BIG_ONE_GOAL_MAX_LENGTH) {
      return err(new ValidationFailure('Hedef metni geçersiz.'));
    }
    return updateEntity(this.repository, (bigOne) =>
      ok({
        ...bigOne,
        goal: trimmed,
        // Aynı metin tekrar kaydedilirse tamamlanma durumu korunur
        isCompleted: bigOne.goal === trimmed && bigOne.isCompleted,
      }),
    );
  }
}
