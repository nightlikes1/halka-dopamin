// Yeni güne geçildiyse günlük sayaçları sıfırlar; sıfırlama yapıldıysa true döner
import { ok, okVoid, type AsyncResult, type Result } from '@core/result/Result';
import { todayOf, type Clock } from '@domain/ports/Clock';
import type { IEntityRepository } from '@domain/repositories/IEntityRepository';
import type { Repositories } from '@domain/repositories/Repositories';
import {
  resetBigOneForNewDay,
  resetBudgetForNewDay,
  resetPomodoroForNewDay,
  resetWaterForNewDay,
} from '@domain/services/dailyResetRules';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

async function resetWith<T>(
  repository: IEntityRepository<T>,
  reset: (value: T) => T,
): Promise<Result<void>> {
  const result = await updateEntity(repository, (value) => ok(reset(value)));
  return result.ok ? okVoid() : result;
}

export class RunDailyResetUseCase {
  constructor(
    private readonly repositories: Repositories,
    private readonly clock: Clock,
  ) {}

  async execute(): AsyncResult<boolean> {
    const today = todayOf(this.clock);
    const r = this.repositories;

    const profile = await r.profile.get();
    if (!profile.ok) return profile;
    if (profile.value.lastActiveDate === today) return ok(false);

    const steps = [
      () => resetWith(r.water, resetWaterForNewDay),
      () => resetWith(r.budget, resetBudgetForNewDay),
      () => resetWith(r.bigOne, resetBigOneForNewDay),
      () => resetWith(r.pomodoro, resetPomodoroForNewDay),
    ];
    for (const step of steps) {
      const result = await step();
      if (!result.ok) return result;
    }

    // Tarih en son yazılır; ara adımda hata olursa bir sonraki açılışta tekrar denenir
    const saved = await r.profile.save({ ...profile.value, lastActiveDate: today });
    return saved.ok ? ok(true) : saved;
  }
}
