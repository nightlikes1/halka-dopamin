// Günlük sıfırlama testleri
import { createFakeRepositories, FakeClock, TEST_NOW, TEST_TODAY } from '../../fakes/fakes';
import { createDefaultSnapshot } from '@domain/entities/defaults';
import { RunDailyResetUseCase } from '@domain/usecases/app/RunDailyResetUseCase';

describe('RunDailyResetUseCase', () => {
  it('aynı gün içinde hiçbir şeyi değiştirmez', async () => {
    const repos = createFakeRepositories(createDefaultSnapshot(TEST_TODAY));

    const result = await new RunDailyResetUseCase(repos, new FakeClock(TEST_NOW)).execute();

    expect(result).toEqual({ ok: true, value: false });
    expect(repos.water.value.current).toBe(1250);
  });

  it('yeni günde günlük sayaçları sıfırlar, kalıcı verileri korur', async () => {
    const snapshot = createDefaultSnapshot('2026-10-13');
    const repos = createFakeRepositories({
      ...snapshot,
      bigOne: { ...snapshot.bigOne, isCompleted: true },
    });

    const result = await new RunDailyResetUseCase(repos, new FakeClock(TEST_NOW)).execute();

    expect(result).toEqual({ ok: true, value: true });
    expect(repos.water.value.current).toBe(0);
    expect(repos.budget.value.expenses).toHaveLength(0);
    expect(repos.bigOne.value).toMatchObject({ isCompleted: false, goal: snapshot.bigOne.goal });
    expect(repos.pomodoro.value.completedSessions).toBe(0);
    expect(repos.profile.value.lastActiveDate).toBe(TEST_TODAY);
    // Görevler ve notlar günlük sıfırlanmaz
    expect(repos.tasks.value.items).toHaveLength(3);
    expect(repos.notes.value.content).toBe(snapshot.notes.content);
  });

  it('ara adım başarısız olursa tarihi güncellemez (sonra tekrar denenir)', async () => {
    const repos = createFakeRepositories(createDefaultSnapshot('2026-10-13'));
    repos.budget.failOnSave = true;

    const result = await new RunDailyResetUseCase(repos, new FakeClock(TEST_NOW)).execute();

    expect(result.ok).toBe(false);
    expect(repos.profile.value.lastActiveDate).toBe('2026-10-13');
  });
});
