// Takvim, gün notu ve ay geçmişi testleri
import { ok, okVoid, type AsyncResult } from '@core/result/Result';
import type { CheckInInput, DailyCheckIn } from '@features/checkin/domain/entities';
import type { CheckInRepository } from '@features/checkin/domain/ports';
import { buildMonthGrid, normalizeNoteText, shiftMonth } from '@features/history/domain/calendar';
import type { DayNote } from '@features/history/domain/entities';
import type { DayNoteRepository } from '@features/history/domain/ports';
import {
  DeleteDayNoteUseCase,
  GetMonthHistoryUseCase,
  SaveDayNoteUseCase,
} from '@features/history/domain/usecases/HistoryUseCases';
import { FakeClock } from '../../../__tests__/fakes/fakes';

const NOW = new Date(2026, 9, 14, 21, 0);

class InMemoryDayNoteRepository implements DayNoteRepository {
  readonly rows = new Map<string, DayNote>();
  saveCount = 0;

  async listRange(from: string, to: string): AsyncResult<readonly DayNote[]> {
    return ok([...this.rows.values()].filter((row) => row.date >= from && row.date <= to));
  }

  async save(date: string, text: string): AsyncResult<DayNote> {
    this.saveCount += 1;
    const row = { date, text, createdAt: 'x', updatedAt: 'y' };
    this.rows.set(date, row);
    return ok(row);
  }

  async delete(date: string): AsyncResult<void> {
    this.rows.delete(date);
    return okVoid();
  }
}

class StaticCheckInRepository implements CheckInRepository {
  constructor(private readonly rows: DailyCheckIn[]) {}
  async get(): AsyncResult<DailyCheckIn | null> {
    return ok(null);
  }
  async listRange(from: string, to: string): AsyncResult<readonly DailyCheckIn[]> {
    return ok(this.rows.filter((row) => row.date >= from && row.date <= to));
  }
  async save(_date: string, _input: CheckInInput): AsyncResult<DailyCheckIn> {
    throw new Error('kullanılmaz');
  }
}

describe('takvim yardımcıları', () => {
  it('Ekim 2026 ızgarası Pazartesi 28 Eylül ile başlar, 42 gün içerir', () => {
    const grid = buildMonthGrid({ year: 2026, month: 10 });

    expect(grid).toHaveLength(42);
    expect(grid[0]).toBe('2026-09-28');
    expect(grid[3]).toBe('2026-10-01'); // Perşembe
  });

  it('ay kaydırma yıl sınırını doğru geçer', () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
  });

  it('not metnini kırpar ve 280 karakter sınırını uygular', () => {
    expect(normalizeNoteText('  zor gündü  ')).toEqual({ ok: true, value: 'zor gündü' });
    expect(normalizeNoteText('   ').ok).toBe(false);
    expect(normalizeNoteText('a'.repeat(280)).ok).toBe(true);
    expect(normalizeNoteText('a'.repeat(281)).ok).toBe(false);
  });
});

describe('Gün notu use caseleri', () => {
  let notes: InMemoryDayNoteRepository;
  let clock: FakeClock;

  beforeEach(() => {
    notes = new InMemoryDayNoteRepository();
    clock = new FakeClock(NOW);
  });

  it('geçmiş güne not ekler, düzenler ve siler', async () => {
    const save = new SaveDayNoteUseCase(notes, clock);

    await save.execute('2026-10-01', 'İlk hali');
    await save.execute('2026-10-01', '  Düzenlenmiş hali ');
    expect(notes.rows.get('2026-10-01')?.text).toBe('Düzenlenmiş hali');

    await new DeleteDayNoteUseCase(notes).execute('2026-10-01');
    expect(notes.rows.size).toBe(0);
  });

  it('gelecek güne ve çok uzun nota izin vermez', async () => {
    const save = new SaveDayNoteUseCase(notes, clock);

    expect((await save.execute('2026-10-15', 'yarın')).ok).toBe(false);
    expect((await save.execute('2026-10-14', 'a'.repeat(281))).ok).toBe(false);
    expect(notes.saveCount).toBe(0);
  });

  it('ay geçmişinde skoru, hatalı günü ve notu birleştirir', async () => {
    await notes.save('2026-10-10', 'Gece geç yattım');
    const checkIns = new StaticCheckInRepository([
      {
        date: '2026-10-10',
        rating: 2,
        entries: [{ habitId: 'phone', status: 'slip' }],
        completedAt: '',
        updatedAt: '',
      },
      { date: '2026-10-11', rating: 5, entries: [], completedAt: '', updatedAt: '' },
    ]);

    const result = await new GetMonthHistoryUseCase(checkIns, notes, clock).execute({
      year: 2026,
      month: 10,
    });
    if (!result.ok) throw new Error(result.error.message);
    const byDate = new Map(result.value.days.map((day) => [day.date, day]));

    expect(byDate.get('2026-10-10')).toMatchObject({
      troubled: true,
      // (0,4·0 + 0,2·0,25) / 0,6 ≈ 8
      balance: { score: 8 },
      note: { text: 'Gece geç yattım' },
    });
    expect(byDate.get('2026-10-11')).toMatchObject({ troubled: false, balance: { score: 100 } });
    expect(byDate.get('2026-10-14')).toMatchObject({ isToday: true, checkIn: null });
    expect(byDate.get('2026-10-20')?.isFuture).toBe(true);
    expect(byDate.get('2026-09-28')?.inMonth).toBe(false);
  });
});
