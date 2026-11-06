// Açılış: kayıtlı veriyi yükleme ve gün değişince sıfırlama
import { type AsyncResult, ok, okVoid, type Result } from '@core/result/Result';
import type { HalkaSnapshot } from '@features/halka/domain/entities/HalkaSnapshot';
import { type Clock, todayOf } from '@core/utils/clock';
import type { AudioPort, IEntityRepository, Repositories } from '@features/halka/domain/ports';
import {
  resetBigOneForNewDay,
  resetBudgetForNewDay,
  resetPomodoroForNewDay,
  resetWaterForNewDay,
} from '@features/halka/domain/services/dailyResetRules';
import { updateEntity } from '@features/halka/domain/usecases/updateEntity';

// Tüm kalıcı durumu tek seferde yükler
export class LoadSnapshotUseCase {
  constructor(private readonly repositories: Repositories) {}

  async execute(): AsyncResult<HalkaSnapshot> {
    const r = this.repositories;

    const profile = await r.profile.get();
    if (!profile.ok) return profile;
    const activeWidgetIds = await r.layout.get();
    if (!activeWidgetIds.ok) return activeWidgetIds;
    const water = await r.water.get();
    if (!water.ok) return water;
    const pomodoro = await r.pomodoro.get();
    if (!pomodoro.ok) return pomodoro;
    const tasks = await r.tasks.get();
    if (!tasks.ok) return tasks;
    const streak = await r.streak.get();
    if (!streak.ok) return streak;
    const notes = await r.notes.get();
    if (!notes.ok) return notes;
    const mood = await r.mood.get();
    if (!mood.ok) return mood;
    const bigOne = await r.bigOne.get();
    if (!bigOne.ok) return bigOne;
    const budget = await r.budget.get();
    if (!budget.ok) return budget;

    return ok({
      profile: profile.value,
      activeWidgetIds: activeWidgetIds.value,
      water: water.value,
      pomodoro: pomodoro.value,
      tasks: tasks.value,
      streak: streak.value,
      notes: notes.value,
      mood: mood.value,
      bigOne: bigOne.value,
      budget: budget.value,
    });
  }
}

// Yeni güne geçildiyse günlük sayaçları sıfırlar; sıfırlama yapıldıysa true döner
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

// Açılış akışı: günlük sıfırlama -> durumu yükle -> ses tercihini uygula
export class InitializeAppUseCase {
  constructor(
    private readonly runDailyReset: RunDailyResetUseCase,
    private readonly loadSnapshot: LoadSnapshotUseCase,
    private readonly audio: AudioPort,
  ) {}

  async execute(): AsyncResult<HalkaSnapshot> {
    const reset = await this.runDailyReset.execute();
    if (!reset.ok) return reset;

    const snapshot = await this.loadSnapshot.execute();
    if (snapshot.ok) this.audio.setEnabled(snapshot.value.profile.soundEnabled);
    return snapshot;
  }
}
