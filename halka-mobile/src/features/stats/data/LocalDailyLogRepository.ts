// Günlük özetlerin cihazdaki kaydı (AsyncStorage, tek anahtar). Bozuk satır atlanır; 62 günden eski
// kayıtlar yazarken budanır.
import { StorageFailure } from '@core/errors/Failure';
import { err, ok, okVoid, type AsyncResult } from '@core/result/Result';
import { addDays } from '@core/utils/date';
import type { KeyValueStorage } from '@features/halka/data/storage';
import { DAILY_LOG_DAYS, type DailyLog } from '@features/stats/domain/entities';
import type { DailyLogRepository } from '@features/stats/domain/ports';

export const DAILY_LOG_STORAGE_KEY = 'halka.dailyLogs.v1';
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const NUMBER_FIELDS = [
  'waterMl',
  'waterTargetMl',
  'tasksDone',
  'tasksTotal',
  'focusSessions',
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function parseLog(value: unknown): DailyLog | null {
  if (!isRecord(value) || typeof value.date !== 'string' || !ISO_DAY.test(value.date)) return null;
  const numbers: Partial<Record<(typeof NUMBER_FIELDS)[number], number>> = {};
  for (const field of NUMBER_FIELDS) {
    const raw = value[field];
    if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < 0) return null;
    numbers[field] = raw;
  }
  return {
    date: value.date,
    waterMl: numbers.waterMl ?? 0,
    waterTargetMl: numbers.waterTargetMl ?? 0,
    tasksDone: numbers.tasksDone ?? 0,
    tasksTotal: numbers.tasksTotal ?? 0,
    focusSessions: numbers.focusSessions ?? 0,
  };
}

export function parseDailyLogs(text: string | null): DailyLog[] {
  if (text === null) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];
  return raw.map(parseLog).filter((log): log is DailyLog => log !== null);
}

export class LocalDailyLogRepository implements DailyLogRepository {
  private cache: DailyLog[] | null = null;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(private readonly storage: KeyValueStorage) {}

  async list(): AsyncResult<readonly DailyLog[]> {
    try {
      return ok(await this.load());
    } catch (error) {
      return err(new StorageFailure('Günlük özetler okunamadı.', error));
    }
  }

  async upsert(log: DailyLog): AsyncResult<void> {
    try {
      const current = await this.load();
      const from = addDays(log.date, -(DAILY_LOG_DAYS - 1));
      const next = [
        ...current.filter((item) => item.date !== log.date && item.date >= from),
        log,
      ].sort((a, b) => a.date.localeCompare(b.date));
      this.cache = next;
      const text = JSON.stringify(next);
      this.writeQueue = this.writeQueue
        .catch(() => undefined)
        .then(() => this.storage.setItem(DAILY_LOG_STORAGE_KEY, text));
      await this.writeQueue;
      return okVoid();
    } catch (error) {
      return err(new StorageFailure('Günlük özet kaydedilemedi.', error));
    }
  }

  private async load(): Promise<DailyLog[]> {
    if (!this.cache) this.cache = parseDailyLogs(await this.storage.getItem(DAILY_LOG_STORAGE_KEY));
    return this.cache;
  }
}
