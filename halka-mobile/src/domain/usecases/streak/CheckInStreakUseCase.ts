// Bugünkü halkayı zincire ekler (günde bir kez)
import type { AsyncResult } from '@core/result/Result';
import type { Streak } from '@domain/entities/Streak';
import { todayOf, type Clock } from '@domain/ports/Clock';
import type { IStreakRepository } from '@domain/repositories/IStreakRepository';
import { checkInStreak } from '@domain/services/streakRules';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class CheckInStreakUseCase {
  constructor(
    private readonly repository: IStreakRepository,
    private readonly clock: Clock,
  ) {}

  execute(): AsyncResult<Streak> {
    const today = todayOf(this.clock);
    return updateEntity(this.repository, (streak) => checkInStreak(streak, today));
  }
}
