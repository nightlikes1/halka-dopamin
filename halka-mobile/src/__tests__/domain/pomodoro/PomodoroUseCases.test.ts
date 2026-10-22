// Pomodoro kuralları ve use case testleri
import { FakeClock, InMemoryRepository, TEST_NOW } from '../../fakes/fakes';
import {
  DEFAULT_POMODORO_DURATIONS,
  getRemainingSeconds,
  type Pomodoro,
} from '@domain/entities/Pomodoro';
import { completePomodoroSession } from '@domain/services/pomodoroRules';
import { CompletePomodoroSessionUseCase } from '@domain/usecases/pomodoro/CompletePomodoroSessionUseCase';
import { PausePomodoroUseCase } from '@domain/usecases/pomodoro/PausePomodoroUseCase';
import { StartPomodoroUseCase } from '@domain/usecases/pomodoro/StartPomodoroUseCase';

const idle = (overrides: Partial<Pomodoro> = {}): Pomodoro => ({
  mode: 'work',
  durations: DEFAULT_POMODORO_DURATIONS,
  remainingSeconds: 25 * 60,
  endsAt: null,
  completedSessions: 0,
  ...overrides,
});

describe('Pomodoro use case', () => {
  let clock: FakeClock;
  let repository: InMemoryRepository<Pomodoro>;

  beforeEach(() => {
    clock = new FakeClock(TEST_NOW);
    repository = new InMemoryRepository(idle());
  });

  it('başlatınca bitiş zamanını kaydeder; arka planda geçen süre kaybolmaz', async () => {
    await new StartPomodoroUseCase(repository, clock).execute();
    expect(repository.value.endsAt).toBe(TEST_NOW.getTime() + 25 * 60 * 1000);

    // Uygulama 10 dakika arka planda kaldı
    clock.advance(10 * 60 * 1000);
    expect(getRemainingSeconds(repository.value, clock.now().getTime())).toBe(15 * 60);
  });

  it('duraklatınca kalan süreyi saklar', async () => {
    await new StartPomodoroUseCase(repository, clock).execute();
    clock.advance(90 * 1000);

    const result = await new PausePomodoroUseCase(repository, clock).execute();

    expect(result.ok && result.value).toMatchObject({
      endsAt: null,
      remainingSeconds: 25 * 60 - 90,
    });
  });

  it('süre dolmadan tamamlanamaz', async () => {
    await new StartPomodoroUseCase(repository, clock).execute();

    const result = await new CompletePomodoroSessionUseCase(repository, clock).execute();

    expect(result.ok).toBe(false);
  });

  it('süre dolunca seansı sayar ve kısa molaya geçer', async () => {
    await new StartPomodoroUseCase(repository, clock).execute();
    clock.advance(25 * 60 * 1000);

    const result = await new CompletePomodoroSessionUseCase(repository, clock).execute();

    expect(result.ok && result.value).toMatchObject({
      mode: 'shortBreak',
      completedSessions: 1,
      remainingSeconds: 5 * 60,
      endsAt: null,
    });
  });
});

describe('completePomodoroSession kuralı', () => {
  it('her 4. odak seansından sonra uzun mola verir', () => {
    expect(completePomodoroSession(idle({ completedSessions: 3 })).mode).toBe('longBreak');
  });

  it('moladan sonra odak moduna döner, seans sayısı artmaz', () => {
    const next = completePomodoroSession(idle({ mode: 'shortBreak', completedSessions: 2 }));
    expect(next).toMatchObject({ mode: 'work', completedSessions: 2, remainingSeconds: 25 * 60 });
  });
});
