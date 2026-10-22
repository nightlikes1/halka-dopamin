import { okVoid, ok, type AsyncResult } from '@core/result/Result';
import type { Clock } from '@domain/ports/Clock';
import type { DatedHabitCheck } from '@features/checkin/domain/entities';
import type { HabitEntryRepository } from '@features/checkin/domain/ports';
import {
  GetHabitEntriesUseCase,
  MarkHabitUseCase,
} from '@features/checkin/domain/usecases/HabitEntryUseCases';
import type { Habit, HabitEntryStatus } from '@features/habits/domain/entities';

// 14 Ekim 2026 akşamı (yerel saat)
const clock: Clock = { now: () => new Date(2026, 9, 14, 21, 0) };
const TODAY = '2026-10-14';

class InMemoryHabitEntryRepository implements HabitEntryRepository {
  readonly rows = new Map<string, DatedHabitCheck>();

  async listRange(from: string, to: string): AsyncResult<readonly DatedHabitCheck[]> {
    return ok([...this.rows.values()].filter((row) => row.date >= from && row.date <= to));
  }

  async mark(date: string, habitId: string, status: HabitEntryStatus): AsyncResult<void> {
    this.rows.set(`${habitId}|${date}`, { habitId, date, status });
    return okVoid();
  }

  async clear(date: string, habitId: string): AsyncResult<void> {
    this.rows.delete(`${habitId}|${date}`);
    return okVoid();
  }
}

const habit = (id: string, kind: Habit['kind']): Habit => ({
  id,
  kind,
  title: id,
  target: { type: 'daily' },
  createdAt: '2026-10-01T00:00:00.000Z',
});

describe('Gün içi alışkanlık işaretleme', () => {
  let repository: InMemoryHabitEntryRepository;
  let mark: MarkHabitUseCase;

  beforeEach(() => {
    repository = new InMemoryHabitEntryRepository();
    mark = new MarkHabitUseCase(repository, clock);
  });

  it('işaretler, bugünün cevaplarında görünür ve geri alınabilir', async () => {
    const read = habit('read', 'build');
    expect((await mark.execute(TODAY, read, 'done')).ok).toBe(true);

    const entries = await new GetHabitEntriesUseCase(repository, clock).execute();
    expect(entries.ok && entries.value).toEqual({
      date: TODAY,
      entries: [{ habitId: 'read', status: 'done' }],
    });

    await mark.execute(TODAY, read, undefined);
    expect(repository.rows.size).toBe(0);
  });

  it('tür ile uyumsuz cevabı depoya göndermez', async () => {
    const result = await mark.execute(TODAY, habit('phone', 'quit'), 'done');
    expect(result.ok).toBe(false);
    expect(repository.rows.size).toBe(0);
  });

  it('bugün ve dün dışındaki günleri reddeder', async () => {
    expect((await mark.execute('2026-10-13', habit('a', 'build'), 'done')).ok).toBe(true);
    expect((await mark.execute('2026-10-10', habit('a', 'build'), 'done')).ok).toBe(false);
  });
});
