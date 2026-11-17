import { formatDayRange } from '@core/utils/date';
import type {
  DailyCheckIn,
  DatedHabitCheck,
  DayRating,
  HabitCheck,
} from '@features/checkin/domain/entities';
import {
  completionPct,
  dopamineBalance,
  logAverages,
  monthMirror,
  moodInsight,
  moodRelation,
  slotOf,
  todayBars,
  urgePattern,
  weekReview,
} from '@features/stats/domain/insights';
import type { UrgeLog, UrgeOutcome } from '@features/today/domain/entities';

const TODAY = '2026-11-17';
const active = new Set(['a', 'b']);

const entry = (date: string, habitId: string, status: HabitCheck['status']): DatedHabitCheck => ({
  date,
  habitId,
  status,
});

const checkIn = (date: string, rating: DayRating, entries: HabitCheck[]): DailyCheckIn => ({
  date,
  rating,
  entries,
  completedAt: `${date}T20:00:00.000Z`,
  updatedAt: `${date}T20:00:00.000Z`,
});

// Yerel saatle dürtü kaydı
const urge = (date: string, hour: number, outcome: UrgeOutcome): UrgeLog => {
  const [y, m, d] = date.split('-').map(Number);
  return {
    id: `${date}-${hour}-${outcome}`,
    kind: 'social',
    outcome,
    date,
    at: new Date(y ?? 0, (m ?? 1) - 1, d ?? 1, hour).toISOString(),
  };
};

describe('completionPct', () => {
  it('yalnız aktif ve yapılan alışkanlıkları sayar', () => {
    const history = [
      entry(TODAY, 'a', 'done'),
      entry(TODAY, 'b', 'missed'),
      entry(TODAY, 'x', 'done'),
    ];
    expect(completionPct(history, active, TODAY)).toBe(50);
    expect(completionPct(history, new Set(), TODAY)).toBe(0);
  });

  it('clean de yapılmış sayılır', () => {
    expect(
      completionPct([entry(TODAY, 'a', 'clean'), entry(TODAY, 'b', 'done')], active, TODAY),
    ).toBe(100);
  });
});

describe('dopamineBalance', () => {
  it('kalıcı = yapılan + geçirilen dürtü, anlık = yapılan dürtü', () => {
    const balance = dopamineBalance(
      [entry(TODAY, 'a', 'done'), entry(TODAY, 'b', 'slip'), entry('2026-10-01', 'a', 'done')],
      [urge(TODAY, 9, 'passed'), urge(TODAY, 10, 'did'), urge(TODAY, 11, 'still')],
      '2026-11-11',
      TODAY,
    );
    expect(balance).toEqual({ lasting: 2, instant: 1, lastingPct: 67 });
  });

  it('kayıt yoksa oran null', () => {
    expect(dopamineBalance([], [], '2026-11-11', TODAY).lastingPct).toBeNull();
  });
});

describe('urgePattern', () => {
  it('dilim sınırları', () => {
    expect(slotOf(5)).toBe('morning');
    expect(slotOf(12)).toBe('afternoon');
    expect(slotOf(17)).toBe('evening');
    expect(slotOf(22)).toBe('late');
    expect(slotOf(3)).toBe('late');
  });

  it('en yoğun dilimi bulur, eşitlikte null', () => {
    const pattern = urgePattern(
      [urge(TODAY, 20, 'did'), urge(TODAY, 21, 'passed'), urge(TODAY, 8, 'did')],
      '2026-10-19',
      TODAY,
    );
    expect(pattern.counts.evening).toBe(2);
    expect(pattern.total).toBe(3);
    expect(pattern.peak).toBe('evening');
    expect(
      urgePattern([urge(TODAY, 20, 'did'), urge(TODAY, 8, 'did')], '2026-10-19', TODAY).peak,
    ).toBeNull();
    expect(urgePattern([], '2026-10-19', TODAY).peak).toBeNull();
  });
});

describe('moodRelation', () => {
  const good = (date: string) =>
    checkIn(date, 5, [
      { habitId: 'a', status: 'done' },
      { habitId: 'b', status: 'done' },
    ]);
  const hard = (date: string) =>
    checkIn(date, 1, [
      { habitId: 'a', status: 'missed' },
      { habitId: 'b', status: 'done' },
    ]);

  it('iyi ve zor günlerde oranı ayırır', () => {
    const relation = moodRelation([
      good('2026-11-10'),
      good('2026-11-11'),
      hard('2026-11-12'),
      hard('2026-11-13'),
    ]);
    expect(relation).toEqual({ goodDaysRate: 100, hardDaysRate: 50, goodDays: 2, hardDays: 2 });
    expect(moodInsight(relation)).toBe('habitsLift');
  });

  it('yetersiz veri ve belirsiz fark', () => {
    expect(moodInsight(moodRelation([good('2026-11-10'), hard('2026-11-12')]))).toBe('notEnough');
    expect(moodInsight({ goodDaysRate: 60, hardDaysRate: 55, goodDays: 3, hardDays: 3 })).toBe(
      'noClearLink',
    );
  });
});

describe('weekReview', () => {
  it('son 7 günü önceki haftayla karşılaştırır, en iyi günü bulur', () => {
    const history = [
      entry('2026-11-17', 'a', 'done'),
      entry('2026-11-17', 'b', 'done'),
      entry('2026-11-15', 'a', 'done'),
      entry('2026-11-05', 'a', 'done'),
    ];
    const review = weekReview(history, [checkIn('2026-11-17', 5, [])], active, TODAY);
    expect(review.from).toBe('2026-11-11');
    expect(review.days).toHaveLength(7);
    expect(review.averagePct).toBe(21); // (100 + 50) / 7
    expect(review.previousPct).toBe(7); // 50 / 7
    expect(review.delta).toBe(14);
    expect(review.bestDay?.date).toBe('2026-11-17');
    expect(review.bestDay?.pct).toBe(100);
    expect(review.averageScore).not.toBeNull();
  });

  it('kayıt yoksa en iyi gün ve skor yok', () => {
    const review = weekReview([], [], active, TODAY);
    expect(review.bestDay).toBeNull();
    expect(review.averageScore).toBeNull();
  });
});

describe('monthMirror', () => {
  it('ayın başından bugüne sayar', () => {
    const history = [
      entry('2026-11-01', 'a', 'done'),
      entry('2026-11-02', 'a', 'done'),
      entry('2026-11-02', 'b', 'clean'),
      entry('2026-11-03', 'b', 'done'),
      entry('2026-11-05', 'a', 'done'),
      entry('2026-10-31', 'a', 'done'),
    ];
    const mirror = monthMirror(
      history,
      [checkIn('2026-11-02', 4, []), checkIn('2026-10-30', 4, [])],
      [
        urge('2026-11-03', 10, 'passed'),
        urge('2026-10-28', 10, 'passed'),
        urge('2026-11-04', 10, 'did'),
      ],
      active,
      TODAY,
    );
    expect(mirror.year).toBe(2026);
    expect(mirror.month).toBe(11);
    expect(mirror.days).toHaveLength(17);
    expect(mirror.fullDays).toBe(1);
    expect(mirror.bestStreak).toBe(3);
    expect(mirror.urgesPassed).toBe(1);
    expect(mirror.checkInDays).toBe(1);
  });
});

describe('todayBars ve logAverages', () => {
  it('çubuklar 0-100 arası', () => {
    expect(
      todayBars(
        { waterMl: 3000, waterTargetMl: 2000, tasksDone: 1, tasksTotal: 4, focusSessions: 2 },
        3,
      ),
    ).toEqual({ water: 100, tasks: 25, focus: 50, mood: 50 });
    expect(
      todayBars(
        { waterMl: 0, waterTargetMl: 0, tasksDone: 0, tasksTotal: 0, focusSessions: 0 },
        null,
      ),
    ).toEqual({ water: 0, tasks: 0, focus: 0, mood: null });
  });

  it('yalnız aralıktaki kayıtların ortalaması', () => {
    const logs = [
      { date: '2026-11-16', waterMl: 1000, waterTargetMl: 2000, focusSessions: 1 },
      { date: '2026-11-17', waterMl: 2000, waterTargetMl: 2000, focusSessions: 2 },
      { date: '2026-11-01', waterMl: 0, waterTargetMl: 2000, focusSessions: 9 },
    ];
    expect(logAverages(logs, '2026-11-11', TODAY)).toEqual({
      days: 2,
      waterPct: 75,
      focusSessions: 1.5,
    });
    expect(logAverages([], '2026-11-11', TODAY)).toEqual({
      days: 0,
      waterPct: null,
      focusSessions: null,
    });
  });
});

describe('formatDayRange', () => {
  it('aynı ayda ve ay geçişinde', () => {
    expect(formatDayRange('2026-11-11', '2026-11-17')).toBe('11 – 17 Kasım');
    expect(formatDayRange('2026-10-28', '2026-11-03')).toBe('28 Ekim – 3 Kasım');
  });
});
