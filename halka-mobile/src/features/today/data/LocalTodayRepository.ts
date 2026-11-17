// Bugün ekranının cihazdaki kayıtları (AsyncStorage, tek anahtar). Bozuk kayıt atlanır; eski günler
// yazarken budanır (dürtüler 62 gün, mini haller 7 gün).
import { StorageFailure } from '@core/errors/Failure';
import { err, ok, okVoid, type AsyncResult } from '@core/result/Result';
import { addDays } from '@core/utils/date';
import type { KeyValueStorage } from '@features/halka/data/storage';
import {
  EMPTY_TODAY_STATE,
  URGE_KINDS,
  type TodayLocalState,
  type UrgeKind,
  type UrgeLog,
  type UrgeOutcome,
} from '@features/today/domain/entities';
import { HISTORY_DAYS } from '@features/today/domain/dayRules';
import type { TodayLocalRepository } from '@features/today/domain/ports';

export const TODAY_STORAGE_KEY = 'halka.today.v1';
const MINI_KEEP_DAYS = 7;
const OUTCOMES: readonly UrgeOutcome[] = ['passed', 'still', 'did'];
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function parseUrge(value: unknown): UrgeLog | null {
  if (!isRecord(value)) return null;
  const { id, kind, outcome, date, at } = value;
  if (typeof id !== 'string' || typeof date !== 'string' || typeof at !== 'string') return null;
  if (!ISO_DAY.test(date)) return null;
  if (!URGE_KINDS.includes(kind as UrgeKind)) return null;
  if (!OUTCOMES.includes(outcome as UrgeOutcome)) return null;
  return { id, kind: kind as UrgeKind, outcome: outcome as UrgeOutcome, date, at };
}

export function parseTodayState(text: string | null): TodayLocalState {
  if (text === null) return EMPTY_TODAY_STATE;
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return EMPTY_TODAY_STATE;
  }
  if (!isRecord(raw)) return EMPTY_TODAY_STATE;
  const urges = Array.isArray(raw.urges)
    ? raw.urges.map(parseUrge).filter((urge): urge is UrgeLog => urge !== null)
    : [];
  const minis: Record<string, readonly string[]> = {};
  if (isRecord(raw.minis)) {
    for (const [day, ids] of Object.entries(raw.minis)) {
      if (ISO_DAY.test(day) && Array.isArray(ids)) {
        minis[day] = ids.filter((id): id is string => typeof id === 'string');
      }
    }
  }
  return {
    urges,
    minis,
    selfNote: typeof raw.selfNote === 'string' ? raw.selfNote : null,
    celebratedOn:
      typeof raw.celebratedOn === 'string' && ISO_DAY.test(raw.celebratedOn)
        ? raw.celebratedOn
        : null,
  };
}

// Eski kayıtları budar (en yeni güne göre)
function prune(state: TodayLocalState, today: string): TodayLocalState {
  const urgeFrom = addDays(today, -(HISTORY_DAYS - 1));
  const miniFrom = addDays(today, -(MINI_KEEP_DAYS - 1));
  return {
    ...state,
    urges: state.urges.filter((urge) => urge.date >= urgeFrom),
    minis: Object.fromEntries(Object.entries(state.minis).filter(([day]) => day >= miniFrom)),
  };
}

export class LocalTodayRepository implements TodayLocalRepository {
  private cache: TodayLocalState | null = null;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(private readonly storage: KeyValueStorage) {}

  async read(): AsyncResult<TodayLocalState> {
    try {
      return ok(await this.load());
    } catch (error) {
      return err(new StorageFailure('Kayıtlar okunamadı.', error));
    }
  }

  addUrge(urge: UrgeLog): AsyncResult<void> {
    return this.update(urge.date, (state) => ({ ...state, urges: [...state.urges, urge] }));
  }

  setMini(date: string, habitId: string, on: boolean): AsyncResult<void> {
    return this.update(date, (state) => {
      const rest = (state.minis[date] ?? []).filter((id) => id !== habitId);
      return { ...state, minis: { ...state.minis, [date]: on ? [...rest, habitId] : rest } };
    });
  }

  setSelfNote(note: string | null): AsyncResult<void> {
    return this.update(null, (state) => ({ ...state, selfNote: note }));
  }

  markCelebrated(date: string): AsyncResult<void> {
    return this.update(date, (state) => ({ ...state, celebratedOn: date }));
  }

  private async load(): Promise<TodayLocalState> {
    if (!this.cache) this.cache = parseTodayState(await this.storage.getItem(TODAY_STORAGE_KEY));
    return this.cache;
  }

  private async update(
    today: string | null,
    mutate: (state: TodayLocalState) => TodayLocalState,
  ): AsyncResult<void> {
    try {
      const current = await this.load();
      const changed = mutate(this.cache ?? current);
      const next = today ? prune(changed, today) : changed;
      this.cache = next;
      const text = JSON.stringify(next);
      this.writeQueue = this.writeQueue
        .catch(() => undefined)
        .then(() => this.storage.setItem(TODAY_STORAGE_KEY, text));
      await this.writeQueue;
      return okVoid();
    } catch (error) {
      return err(new StorageFailure('Kayıt yapılamadı.', error));
    }
  }
}
