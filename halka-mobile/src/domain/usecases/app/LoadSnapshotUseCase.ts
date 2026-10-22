// Tüm kalıcı durumu tek seferde yükler
import { ok, type AsyncResult } from '@core/result/Result';
import type { HalkaSnapshot } from '@domain/entities/HalkaSnapshot';
import type { Repositories } from '@domain/repositories/Repositories';

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
