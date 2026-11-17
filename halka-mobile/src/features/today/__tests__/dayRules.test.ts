import type { DatedHabitCheck } from '@features/checkin/domain/entities';
import {
  activityStreak,
  cleanStreak,
  dayProgress,
  isDayComplete,
  isEveningOpen,
  mergeToday,
  ringMood,
  urgeStats,
} from '@features/today/domain/dayRules';
import type { UrgeLog } from '@features/today/domain/entities';

const TODAY = '2026-11-17';
const check = (
  date: string,
  habitId: string,
  status: DatedHabitCheck['status'],
): DatedHabitCheck => ({
  date,
  habitId,
  status,
});
const urge = (date: string, outcome: UrgeLog['outcome']): UrgeLog => ({
  id: `${date}-${outcome}-${Math.random()}`,
  kind: 'social',
  outcome,
  date,
  at: `${date}T10:00:00.000Z`,
});

describe('dayProgress', () => {
  it('yalnızca aktif alışkanlıkların yapılan cevaplarını sayar', () => {
    const habits = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const entries = [
      { habitId: 'a', status: 'done' as const },
      { habitId: 'b', status: 'missed' as const },
      { habitId: 'x', status: 'done' as const },
    ];
    expect(dayProgress(habits, entries)).toEqual({ done: 1, total: 3, pct: 33 });
  });

  it('alışkanlık yoksa sıfır', () => {
    expect(dayProgress([], [])).toEqual({ done: 0, total: 0, pct: 0 });
    expect(isDayComplete({ done: 0, total: 0, pct: 0 })).toBe(false);
    expect(isDayComplete({ done: 2, total: 2, pct: 100 })).toBe(true);
  });
});

describe('seriler', () => {
  it('bugün henüz yapılmadıysa dünden geriye sayar', () => {
    const entries = [
      check('2026-11-16', 'a', 'done'),
      check('2026-11-15', 'b', 'clean'),
      check('2026-11-13', 'a', 'done'),
    ];
    expect(activityStreak(entries, TODAY)).toBe(2);
  });

  it('bugün yapıldıysa bugünü de sayar; yapılmayan cevap seri değildir', () => {
    const entries = [check(TODAY, 'a', 'done'), check('2026-11-16', 'a', 'missed')];
    expect(activityStreak(entries, TODAY)).toBe(1);
  });

  it('bırakılan alışkanlıkta ardışık temiz geceler', () => {
    const entries = [
      check('2026-11-16', 'q', 'clean'),
      check('2026-11-15', 'q', 'clean'),
      check('2026-11-14', 'q', 'slip'),
      check('2026-11-16', 'other', 'clean'),
    ];
    expect(cleanStreak(entries, 'q', TODAY)).toBe(2);
  });

  it('bugünün güncel cevapları geçmişteki bugünün yerine geçer', () => {
    const history = [check(TODAY, 'a', 'done'), check('2026-11-16', 'a', 'done')];
    const merged = mergeToday(history, TODAY, [{ habitId: 'a', status: 'missed' }]);
    expect(merged).toContainEqual(check(TODAY, 'a', 'missed'));
    expect(merged).not.toContainEqual(check(TODAY, 'a', 'done'));
    expect(activityStreak(merged, TODAY)).toBe(1);
  });
});

describe('ringMood', () => {
  it('"yaptım" denen dürtüler kalıcılardan fazlaysa hareketli', () => {
    expect(ringMood(0, [urge(TODAY, 'did')])).toBe('lively');
    expect(ringMood(1, [urge(TODAY, 'did')])).toBe('calm');
    expect(ringMood(0, [urge(TODAY, 'did'), urge(TODAY, 'passed')])).toBe('calm');
  });
});

describe('urgeStats', () => {
  it('son 7 günü sayar; "hâlâ" oranı etkilemez', () => {
    const urges = [
      urge(TODAY, 'passed'),
      urge('2026-11-12', 'passed'),
      urge('2026-11-11', 'did'),
      urge('2026-11-14', 'still'),
      urge('2026-11-10', 'passed'),
    ];
    expect(urgeStats(urges, TODAY)).toEqual({ passedThisWeek: 2, passRate: 67 });
  });

  it('kayıt yoksa oran null', () => {
    expect(urgeStats([], TODAY)).toEqual({ passedThisWeek: 0, passRate: null });
  });
});

describe('isEveningOpen', () => {
  it("19:00'dan sonra açık", () => {
    expect(isEveningOpen(18)).toBe(false);
    expect(isEveningOpen(19)).toBe(true);
  });
});
