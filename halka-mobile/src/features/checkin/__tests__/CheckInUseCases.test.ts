// Check-in kuralları ve use case'leri
import { ok, type AsyncResult } from '@core/result/Result';
import type { CheckInInput, DailyCheckIn } from '@features/checkin/domain/entities';
import type { CheckInRepository } from '@features/checkin/domain/ports';
import { resolveCheckInDay, validateCheckInInput } from '@features/checkin/domain/rules';
import {
  GetCheckInOverviewUseCase,
  OpenCheckInUseCase,
  SaveCheckInUseCase,
} from '@features/checkin/domain/usecases/CheckInUseCases';
import type { Habit } from '@features/habits/domain/entities';
import { FakeClock } from '../../../__tests__/fakes/fakes';

// 14 Ekim 2026, 22:30 (yerel)
const NOW = new Date(2026, 9, 14, 22, 30);
const TODAY = '2026-10-14';
const YESTERDAY = '2026-10-13';

const HABITS: Habit[] = [
  { id: 'read', kind: 'build', title: 'Kitap', target: { type: 'daily' }, createdAt: '' },
  { id: 'phone', kind: 'quit', title: 'Gece telefon', target: { type: 'daily' }, createdAt: '' },
];

class InMemoryCheckInRepository implements CheckInRepository {
  readonly rows = new Map<string, DailyCheckIn>();
  saveCount = 0;

  async get(date: string): AsyncResult<DailyCheckIn | null> {
    return ok(this.rows.get(date) ?? null);
  }

  async listRange(from: string, to: string): AsyncResult<readonly DailyCheckIn[]> {
    return ok([...this.rows.values()].filter((row) => row.date >= from && row.date <= to));
  }

  async save(date: string, input: CheckInInput): AsyncResult<DailyCheckIn> {
    this.saveCount += 1;
    const existing = this.rows.get(date);
    const row: DailyCheckIn = {
      date,
      rating:
        input.rating === 1
          ? 1
          : input.rating === 2
            ? 2
            : input.rating === 3
              ? 3
              : input.rating === 4
                ? 4
                : 5,
      entries: input.entries,
      completedAt: existing?.completedAt ?? 'ilk',
      updatedAt: 'son',
    };
    this.rows.set(date, row);
    return ok(row);
  }
}

describe('resolveCheckInDay', () => {
  it('bugünü ve dünü kabul eder, diğer günleri reddeder', () => {
    expect(resolveCheckInDay(TODAY, TODAY)).toBe('today');
    expect(resolveCheckInDay(YESTERDAY, TODAY)).toBe('yesterday');
    expect(resolveCheckInDay('2026-10-12', TODAY)).toBeNull();
    expect(resolveCheckInDay('2026-10-15', TODAY)).toBeNull();
  });

  it('ay ve yıl geçişlerinde doğru çalışır', () => {
    expect(resolveCheckInDay('2026-12-31', '2027-01-01')).toBe('yesterday');
  });
});

describe('validateCheckInInput', () => {
  it('geçerli girdiyi kabul eder', () => {
    const result = validateCheckInInput(
      { rating: 4, entries: [{ habitId: 'read', status: 'done' }] },
      HABITS,
    );
    expect(result.ok).toBe(true);
  });

  it.each([
    ['puan aralık dışı', { rating: 0, entries: [] }],
    ['ondalıklı puan', { rating: 3.5, entries: [] }],
    ['türle uyumsuz cevap', { rating: 3, entries: [{ habitId: 'read', status: 'slip' }] }],
    ['bilinmeyen alışkanlık', { rating: 3, entries: [{ habitId: 'x', status: 'done' }] }],
    [
      'tekrar eden alışkanlık',
      {
        rating: 3,
        entries: [
          { habitId: 'read', status: 'done' },
          { habitId: 'read', status: 'missed' },
        ],
      },
    ],
  ] as const)('%s reddedilir', (_label, input) => {
    expect(validateCheckInInput(input, HABITS).ok).toBe(false);
  });
});

describe('Check-in use caseleri', () => {
  let repository: InMemoryCheckInRepository;
  let clock: FakeClock;

  beforeEach(() => {
    repository = new InMemoryCheckInRepository();
    clock = new FakeClock(NOW);
  });

  it('kaydedince skor ve hatalı gün bilgisini döndürür', async () => {
    const result = await new SaveCheckInUseCase(repository, clock).execute(
      TODAY,
      {
        rating: 3,
        entries: [
          { habitId: 'read', status: 'done' },
          { habitId: 'phone', status: 'slip' },
        ],
      },
      HABITS,
    );

    expect(result.ok && result.value.balance.score).toBe(50);
    expect(result.ok && result.value.troubled).toBe(true);
  });

  it('aynı gün tekrar açılınca düzenleme moduna geçer ve ilk kaydı korur', async () => {
    const save = new SaveCheckInUseCase(repository, clock);
    await save.execute(TODAY, { rating: 2, entries: [] }, HABITS);

    const session = await new OpenCheckInUseCase(repository, clock).execute(TODAY);
    expect(session.ok && session.value.existing?.rating).toBe(2);

    const edited = await save.execute(TODAY, { rating: 5, entries: [] }, HABITS);
    expect(edited.ok && edited.value.checkIn).toMatchObject({ rating: 5, completedAt: 'ilk' });
    expect(repository.rows.size).toBe(1);
  });

  it('dün için yapılabilir, daha eski günler için yapılamaz', async () => {
    const save = new SaveCheckInUseCase(repository, clock);

    expect((await save.execute(YESTERDAY, { rating: 3, entries: [] }, HABITS)).ok).toBe(true);
    expect((await save.execute('2026-10-10', { rating: 3, entries: [] }, HABITS)).ok).toBe(false);
    expect((await new OpenCheckInUseCase(repository, clock).execute('2026-10-10')).ok).toBe(false);
  });

  it('geçersiz girdi depoya hiç gitmez', async () => {
    await new SaveCheckInUseCase(repository, clock).execute(
      TODAY,
      { rating: 9, entries: [] },
      HABITS,
    );

    expect(repository.saveCount).toBe(0);
  });

  it('gece yarısı geçince "bugün" yeni güne kayar', async () => {
    await new SaveCheckInUseCase(repository, clock).execute(
      TODAY,
      { rating: 4, entries: [] },
      HABITS,
    );
    clock.set(new Date(2026, 9, 15, 0, 30));

    const overview = await new GetCheckInOverviewUseCase(repository, clock).execute();

    expect(overview.ok && overview.value.today).toBe('2026-10-15');
    expect(overview.ok && overview.value.todayCheckIn).toBeNull();
    expect(overview.ok && overview.value.yesterdayCheckIn?.rating).toBe(4);
  });
});
