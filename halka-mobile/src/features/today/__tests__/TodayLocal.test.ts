import { FakeClock } from '@features/halka/__tests__/fakes/fakes';
import type { KeyValueStorage } from '@features/halka/data/storage';
import {
  LocalTodayRepository,
  TODAY_STORAGE_KEY,
  parseTodayState,
} from '@features/today/data/LocalTodayRepository';
import { EMPTY_TODAY_STATE } from '@features/today/domain/entities';
import {
  LogUrgeUseCase,
  MarkCelebratedUseCase,
  SaveSelfNoteUseCase,
  SetMiniUseCase,
} from '@features/today/domain/usecases/TodayUseCases';

class MemoryStorage implements KeyValueStorage {
  readonly data = new Map<string, string>();
  getItem(key: string): Promise<string | null> {
    return Promise.resolve(this.data.get(key) ?? null);
  }
  setItem(key: string, value: string): Promise<void> {
    this.data.set(key, value);
    return Promise.resolve();
  }
  removeItem(key: string): Promise<void> {
    this.data.delete(key);
    return Promise.resolve();
  }
}

const NOW = new Date(2026, 10, 17, 10, 0, 0);

describe('parseTodayState', () => {
  it('boş ya da bozuk kayıt boş duruma döner', () => {
    expect(parseTodayState(null)).toEqual(EMPTY_TODAY_STATE);
    expect(parseTodayState('{bozuk')).toEqual(EMPTY_TODAY_STATE);
    expect(parseTodayState('[1,2]')).toEqual(EMPTY_TODAY_STATE);
  });

  it('geçersiz dürtüleri ve günleri atlar', () => {
    const state = parseTodayState(
      JSON.stringify({
        urges: [
          { id: '1', kind: 'social', outcome: 'passed', date: '2026-11-17', at: 'x' },
          { id: '2', kind: 'uzay', outcome: 'passed', date: '2026-11-17', at: 'x' },
          { id: '3', kind: 'snack', outcome: 'belki', date: '2026-11-17', at: 'x' },
        ],
        minis: { '2026-11-17': ['a', 3], dun: ['b'] },
        selfNote: 'Nefes al',
        celebratedOn: 'dün',
      }),
    );
    expect(state.urges.map((u) => u.id)).toEqual(['1']);
    expect(state.minis).toEqual({ '2026-11-17': ['a'] });
    expect(state.selfNote).toBe('Nefes al');
    expect(state.celebratedOn).toBeNull();
  });
});

describe('LocalTodayRepository + use case', () => {
  const setup = () => {
    const storage = new MemoryStorage();
    const repo = new LocalTodayRepository(storage);
    const clock = new FakeClock(NOW);
    return { storage, repo, clock };
  };

  it('dürtü, mini hal ve kutlamayı kaydeder; eski mini halleri budar', async () => {
    const { storage, repo, clock } = setup();
    storage.data.set(TODAY_STORAGE_KEY, JSON.stringify({ minis: { '2026-11-01': ['eski'] } }));
    await new LogUrgeUseCase(repo, clock, () => 'u1').execute('snack', 'passed');
    await new SetMiniUseCase(repo, clock).execute('h1', true);
    await new MarkCelebratedUseCase(repo, clock).execute();

    const saved = parseTodayState(storage.data.get(TODAY_STORAGE_KEY) ?? null);
    expect(saved.urges).toHaveLength(1);
    expect(saved.urges[0]).toMatchObject({ id: 'u1', kind: 'snack', date: '2026-11-17' });
    expect(saved.minis).toEqual({ '2026-11-17': ['h1'] });
    expect(saved.celebratedOn).toBe('2026-11-17');

    await new SetMiniUseCase(repo, clock).execute('h1', false);
    const read = await repo.read();
    expect(read.ok && read.value.minis['2026-11-17']).toEqual([]);
  });

  it('kendine not: boş not varsayılana döner, uzun not reddedilir', async () => {
    const { repo } = setup();
    const save = new SaveSelfNoteUseCase(repo);
    expect((await save.execute('  Geçecek  ')).ok).toBe(true);
    let read = await repo.read();
    expect(read.ok && read.value.selfNote).toBe('Geçecek');

    expect((await save.execute('a'.repeat(161))).ok).toBe(false);
    expect((await save.execute('   ')).ok).toBe(true);
    read = await repo.read();
    expect(read.ok && read.value.selfNote).toBeNull();
  });
});
