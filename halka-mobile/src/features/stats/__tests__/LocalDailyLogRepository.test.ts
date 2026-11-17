import { InMemoryKeyValueStorage } from '@features/halka/__tests__/fakes/fakes';
import {
  DAILY_LOG_STORAGE_KEY,
  LocalDailyLogRepository,
  parseDailyLogs,
} from '@features/stats/data/LocalDailyLogRepository';
import type { DailyLog } from '@features/stats/domain/entities';

const log = (date: string, waterMl = 500): DailyLog => ({
  date,
  waterMl,
  waterTargetMl: 2000,
  tasksDone: 1,
  tasksTotal: 3,
  focusSessions: 2,
});

describe('parseDailyLogs', () => {
  it('bozuk veriyi ve satırları atlar', () => {
    expect(parseDailyLogs(null)).toEqual([]);
    expect(parseDailyLogs('{bozuk')).toEqual([]);
    expect(parseDailyLogs('{"a":1}')).toEqual([]);
    const text = JSON.stringify([
      log('2026-11-17'),
      { date: 'dün' },
      { ...log('2026-11-16'), waterMl: -1 },
    ]);
    expect(parseDailyLogs(text)).toEqual([log('2026-11-17')]);
  });
});

describe('LocalDailyLogRepository', () => {
  it('aynı günü günceller, sıralar ve 62 günden eskisini budar', async () => {
    const storage = new InMemoryKeyValueStorage();
    await storage.setItem(
      DAILY_LOG_STORAGE_KEY,
      JSON.stringify([log('2026-09-01'), log('2026-11-16')]),
    );
    const repo = new LocalDailyLogRepository(storage);

    await repo.upsert(log('2026-11-17'));
    await repo.upsert(log('2026-11-17', 1500));
    await repo.upsert(log('2026-11-15'));

    const result = await repo.list();
    expect(result.ok && result.value.map((item) => item.date)).toEqual([
      '2026-11-15',
      '2026-11-16',
      '2026-11-17',
    ]);
    expect(result.ok && result.value[2]?.waterMl).toBe(1500);
    // Yeni bir depo aynı veriyi okur
    const reread = await new LocalDailyLogRepository(storage).list();
    expect(reread.ok && reread.value).toHaveLength(3);
  });
});
