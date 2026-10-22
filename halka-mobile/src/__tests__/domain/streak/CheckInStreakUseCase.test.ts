// Zincir (seri) use case testleri
import { FakeClock, InMemoryRepository, TEST_NOW, TEST_TODAY } from '../../fakes/fakes';
import { getCurrentStreak, getStreakHistory, type Streak } from '@domain/entities/Streak';
import { CheckInStreakUseCase } from '@domain/usecases/streak/CheckInStreakUseCase';

const streakWith = (checkedDates: string[], bestStreak = 0): Streak => ({
  habitName: 'Okuma',
  bestStreak,
  checkedDates,
});

describe('CheckInStreakUseCase', () => {
  it('dünkü seriye bugünü ekler ve seriyi uzatır', async () => {
    const repository = new InMemoryRepository(streakWith(['2026-10-12', '2026-10-13'], 1));
    const useCase = new CheckInStreakUseCase(repository, new FakeClock(TEST_NOW));

    const result = await useCase.execute();

    expect(result.ok).toBe(true);
    expect(getCurrentStreak(repository.value, TEST_TODAY)).toBe(3);
    expect(repository.value.bestStreak).toBe(3);
  });

  it('aynı gün ikinci kez eklenemez (web sürümündeki hata düzeltildi)', async () => {
    const repository = new InMemoryRepository(streakWith([TEST_TODAY]));
    const useCase = new CheckInStreakUseCase(repository, new FakeClock(TEST_NOW));

    const result = await useCase.execute();

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('validation');
    expect(repository.saveCount).toBe(0);
  });

  it('gün atlanınca zincir kırılır ve 1 den başlar', async () => {
    const repository = new InMemoryRepository(streakWith(['2026-10-10', '2026-10-11'], 9));
    const useCase = new CheckInStreakUseCase(repository, new FakeClock(TEST_NOW));

    await useCase.execute();

    expect(getCurrentStreak(repository.value, TEST_TODAY)).toBe(1);
    expect(repository.value.bestStreak).toBe(9);
  });
});

describe('getStreakHistory', () => {
  it('bugün dahil son 7 günü eskiden yeniye döndürür', () => {
    const history = getStreakHistory(streakWith(['2026-10-08', TEST_TODAY]), TEST_TODAY);

    expect(history).toHaveLength(7);
    expect(history[0]).toEqual({ date: '2026-10-08', done: true });
    expect(history[6]).toEqual({ date: TEST_TODAY, done: true });
    expect(history.filter((day) => day.done)).toHaveLength(2);
  });
});
