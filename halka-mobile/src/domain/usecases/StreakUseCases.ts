// Zincir (seri) işaretleme
import type { AsyncResult } from '@core/result/Result';
import type { Streak } from '@domain/entities/Streak';
import { type Clock, type IEntityRepository, todayOf } from '@domain/ports';
import { checkInStreak } from '@domain/services/streakRules';
import { updateEntity } from '@domain/usecases/updateEntity';

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
