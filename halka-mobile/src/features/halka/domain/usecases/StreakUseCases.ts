// Zincir (seri) işaretleme
import type { AsyncResult } from '@core/result/Result';
import type { Streak } from '@features/halka/domain/entities/Streak';
import { type Clock, todayOf } from '@core/utils/clock';
import type { IEntityRepository } from '@features/halka/domain/ports';
import { checkInStreak } from '@features/halka/domain/services/streakRules';
import { updateEntity } from '@features/halka/domain/usecases/updateEntity';

// Bugünkü halkayı zincire ekler (günde bir kez)
export class CheckInStreakUseCase {
  constructor(
    private readonly repository: IEntityRepository<Streak>,
    private readonly clock: Clock,
  ) {}

  execute(): AsyncResult<Streak> {
    const today = todayOf(this.clock);
    return updateEntity(this.repository, (streak) => checkInStreak(streak, today));
  }
}
