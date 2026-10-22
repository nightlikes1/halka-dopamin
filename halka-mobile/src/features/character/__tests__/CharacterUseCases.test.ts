// Karakter taslak doğrulaması ve ekran özeti
import { ok, okVoid, type AsyncResult } from '@core/result/Result';
import type { CheckInInput, DailyCheckIn } from '@features/checkin/domain/entities';
import type { CheckInRepository } from '@features/checkin/domain/ports';
import type { Character, CharacterDraft } from '@features/character/domain/entities';
import type { CharacterRepository } from '@features/character/domain/ports';
import { normalizeCharacterDraft } from '@features/character/domain/rules';
import {
  GetCharacterOverviewUseCase,
  SaveCharacterUseCase,
  TREND_DAYS,
} from '@features/character/domain/usecases/CharacterUseCases';
import type { CreateHabitInput, Habit } from '@features/habits/domain/entities';
import type { HabitRepository } from '@features/habits/domain/ports';
import { FakeClock } from '../../../__tests__/fakes/fakes';

const NOW = new Date(2026, 9, 14, 21, 0);

const habit = (id: string): Habit => ({
  id,
  kind: 'build',
  title: id,
  target: { type: 'daily' },
  createdAt: '',
});

class FakeCharacterRepository implements CharacterRepository {
  constructor(public stored: Character | null) {}
  saved: CharacterDraft | null = null;
  async get(): AsyncResult<Character | null> {
    return ok(this.stored);
  }
  async save(draft: CharacterDraft): AsyncResult<Character> {
    this.saved = draft;
    const character: Character = {
      id: 'c1',
      identity: draft.identity,
      createdAt: '',
      avatar: draft.avatar ?? null,
      look: draft.look ?? null,
      dicebear: draft.dicebear ?? null,
      traits: draft.traits.map((trait, order) => ({ id: `t${order}`, order, ...trait })),
    };
    this.stored = character;
    return ok(character);
  }
  async delete(): AsyncResult<void> {
    this.stored = null;
    return okVoid();
  }
}

class FakeHabitRepository implements HabitRepository {
  constructor(private readonly habits: Habit[]) {}
  async listActive(): AsyncResult<readonly Habit[]> {
    return ok(this.habits);
  }
  async create(_input: CreateHabitInput): AsyncResult<Habit> {
    throw new Error('kullanılmaz');
  }
  async archive(): AsyncResult<void> {
    return okVoid();
  }
}

class FakeCheckInRepository implements CheckInRepository {
  requested: { from: string; to: string } | null = null;
  constructor(private readonly rows: DailyCheckIn[]) {}
  async get(): AsyncResult<DailyCheckIn | null> {
    return ok(null);
  }
  async listRange(from: string, to: string): AsyncResult<readonly DailyCheckIn[]> {
    this.requested = { from, to };
    return ok(this.rows.filter((row) => row.date >= from && row.date <= to));
  }
  async save(_date: string, _input: CheckInInput): AsyncResult<DailyCheckIn> {
    throw new Error('kullanılmaz');
  }
}

describe('normalizeCharacterDraft', () => {
  it('metinleri kırpar ve tekrar eden bağları atar', () => {
    const result = normalizeCharacterDraft({
      identity: '  Sakin biri  ',
      traits: [{ name: ' Sakin ', habitIds: ['h1', 'h1'] }],
    });
    expect(result).toEqual({
      ok: true,
      value: { identity: 'Sakin biri', traits: [{ name: 'Sakin', habitIds: ['h1'] }] },
    });
  });

  it.each([
    ['boş kimlik', { identity: ' ', traits: [{ name: 'A', habitIds: [] }] }],
    ['uzun kimlik', { identity: 'a'.repeat(61), traits: [{ name: 'A', habitIds: [] }] }],
    ['özelliksiz', { identity: 'Biri', traits: [] }],
    [
      '6 özellik',
      { identity: 'Biri', traits: 'ABCDEF'.split('').map((name) => ({ name, habitIds: [] })) },
    ],
    [
      'Türkçe büyük/küçük harfle tekrar',
      {
        identity: 'Biri',
        traits: [
          { name: 'İyi', habitIds: [] },
          { name: 'iyi', habitIds: [] },
        ],
      },
    ],
  ])('%s reddedilir', (_label, draft) => {
    expect(normalizeCharacterDraft(draft).ok).toBe(false);
  });
});

describe('Karakter use caseleri', () => {
  it('geçersiz taslak depoya gitmez', async () => {
    const repository = new FakeCharacterRepository(null);
    const result = await new SaveCharacterUseCase(repository).execute({
      identity: '',
      traits: [],
    });
    expect(result.ok).toBe(false);
    expect(repository.saved).toBeNull();
  });

  it('karakter yokken boş özet döner ve check-in istemez', async () => {
    const checkIns = new FakeCheckInRepository([]);
    const result = await new GetCharacterOverviewUseCase(
      new FakeCharacterRepository(null),
      new FakeHabitRepository([]),
      checkIns,
      new FakeClock(NOW),
    ).execute();

    expect(result.ok && result.value.character).toBeNull();
    expect(checkIns.requested).toBeNull();
  });

  it('özeti hesaplar; silinmiş alışkanlık bağını yok sayar', async () => {
    const character: Character = {
      id: 'c1',
      identity: 'Meraklı biri',
      createdAt: '',
      avatar: null,
      look: null,
      dicebear: null,
      traits: [{ id: 't1', name: 'Meraklı', order: 0, habitIds: ['kitap', 'silinmis'] }],
    };
    const checkIns = new FakeCheckInRepository([
      {
        date: '2026-10-14',
        rating: 5,
        entries: [
          { habitId: 'kitap', status: 'done' },
          { habitId: 'silinmis', status: 'missed' },
        ],
        completedAt: '',
        updatedAt: '',
      },
    ]);

    const result = await new GetCharacterOverviewUseCase(
      new FakeCharacterRepository(character),
      new FakeHabitRepository([habit('kitap')]),
      checkIns,
      new FakeClock(NOW),
    ).execute();
    if (!result.ok) throw new Error(result.error.message);

    expect(checkIns.requested).toEqual({ from: '2026-09-15', to: '2026-10-14' });
    expect(result.value.week).toHaveLength(7);
    expect(result.value.proximity).toBeCloseTo(100);
    const [summary] = result.value.traits;
    expect(summary?.habits.map((h) => h.id)).toEqual(['kitap']);
    expect(summary?.today).toEqual({ linked: 1, answered: 1, done: 1 });
    expect(summary?.trend).toHaveLength(TREND_DAYS);
  });
});
