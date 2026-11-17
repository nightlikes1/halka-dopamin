// Gelişim içgörüleri (saf): gün oranları, denge skorları, dopamin dengesi, dürtü saat örüntüsü,
// ruh hali–alışkanlık ilişkisi, haftalık bakış ve ay aynası.
import { addDays, daysBetween } from '@core/utils/date';
import { computeDailyBalance } from '@features/checkin/domain/balance';
import type { DailyCheckIn, DatedHabitCheck, HabitCheck } from '@features/checkin/domain/entities';
import type { UrgeLog } from '@features/today/domain/entities';

const isDone = (entry: HabitCheck) => entry.status === 'done' || entry.status === 'clean';

// Aralıktaki günler (dahil, eskiden yeniye)
export function daysInRange(from: string, to: string): string[] {
  const count = daysBetween(from, to) + 1;
  return Array.from({ length: Math.max(0, count) }, (_, index) => addDays(from, index));
}

// Bir günün halka oranı: o gün yapılan / bugünkü aktif alışkanlık (0-100)
export function completionPct(
  history: readonly DatedHabitCheck[],
  activeIds: ReadonlySet<string>,
  date: string,
): number {
  if (activeIds.size === 0) return 0;
  const done = history.filter(
    (entry) => entry.date === date && activeIds.has(entry.habitId) && isDone(entry),
  ).length;
  return Math.min(100, Math.round((done / activeIds.size) * 100));
}

export function averagePct(
  history: readonly DatedHabitCheck[],
  activeIds: ReadonlySet<string>,
  days: readonly string[],
): number {
  if (days.length === 0) return 0;
  const sum = days.reduce((total, day) => total + completionPct(history, activeIds, day), 0);
  return Math.round(sum / days.length);
}

// Check-in denge skorları (gün → 0-100)
export function balanceScores(checkIns: readonly DailyCheckIn[]): ReadonlyMap<string, number> {
  return new Map(
    checkIns.map((checkIn) => [
      checkIn.date,
      computeDailyBalance({ rating: checkIn.rating, entries: checkIn.entries }).score,
    ]),
  );
}

const inRange = (date: string, from: string, to: string) => date >= from && date <= to;

// Dopamin dengesi: kalıcı = yapılan alışkanlık + geçirilen dürtü; anlık = "yaptım" denen dürtü
export interface DopamineBalance {
  readonly lasting: number;
  readonly instant: number;
  readonly lastingPct: number | null;
}

export function dopamineBalance(
  history: readonly DatedHabitCheck[],
  urges: readonly UrgeLog[],
  from: string,
  to: string,
): DopamineBalance {
  const habits = history.filter((entry) => inRange(entry.date, from, to) && isDone(entry)).length;
  const ranged = urges.filter((urge) => inRange(urge.date, from, to));
  const passed = ranged.filter((urge) => urge.outcome === 'passed').length;
  const instant = ranged.filter((urge) => urge.outcome === 'did').length;
  const lasting = habits + passed;
  const total = lasting + instant;
  return { lasting, instant, lastingPct: total > 0 ? Math.round((lasting / total) * 100) : null };
}

// Dürtülerin günün dilimlerine dağılımı (yerel saat)
export const URGE_SLOTS = ['morning', 'afternoon', 'evening', 'late'] as const;
export type UrgeSlot = (typeof URGE_SLOTS)[number];

export function slotOf(hour: number): UrgeSlot {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'late';
}

export interface UrgePattern {
  readonly counts: Readonly<Record<UrgeSlot, number>>;
  readonly total: number;
  // En yoğun dilim; kayıt yoksa ya da eşitlik varsa null
  readonly peak: UrgeSlot | null;
}

export function urgePattern(urges: readonly UrgeLog[], from: string, to: string): UrgePattern {
  const counts: Record<UrgeSlot, number> = { morning: 0, afternoon: 0, evening: 0, late: 0 };
  let total = 0;
  for (const urge of urges) {
    if (!inRange(urge.date, from, to)) continue;
    const at = new Date(urge.at);
    if (Number.isNaN(at.getTime())) continue;
    counts[slotOf(at.getHours())] += 1;
    total += 1;
  }
  const max = Math.max(...URGE_SLOTS.map((slot) => counts[slot]));
  const leaders = URGE_SLOTS.filter((slot) => counts[slot] === max);
  return { counts, total, peak: max > 0 && leaders.length === 1 ? (leaders[0] ?? null) : null };
}

// Ruh hali–alışkanlık ilişkisi: iyi (puan ≥ 4) ve zor (puan ≤ 2) günlerde alışkanlık yapılma oranı
export interface MoodRelation {
  readonly goodDaysRate: number | null; // 0-100
  readonly hardDaysRate: number | null;
  readonly goodDays: number;
  readonly hardDays: number;
}

export function moodRelation(checkIns: readonly DailyCheckIn[]): MoodRelation {
  const rates = (filter: (rating: number) => boolean) => {
    const values = checkIns
      .filter((checkIn) => filter(checkIn.rating) && checkIn.entries.length > 0)
      .map((checkIn) => checkIn.entries.filter(isDone).length / checkIn.entries.length);
    return {
      days: values.length,
      rate:
        values.length > 0
          ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100)
          : null,
    };
  };
  const good = rates((rating) => rating >= 4);
  const hard = rates((rating) => rating <= 2);
  return {
    goodDaysRate: good.rate,
    hardDaysRate: hard.rate,
    goodDays: good.days,
    hardDays: hard.days,
  };
}

// İlişkiyi söylemek için iki grupta da en az bu kadar gün ve bu kadar fark gerekir
export const RELATION_MIN_DAYS = 2;
export const RELATION_MIN_GAP = 15;

export type MoodInsight = 'habitsLift' | 'noClearLink' | 'notEnough';

export function moodInsight(relation: MoodRelation): MoodInsight {
  const { goodDaysRate, hardDaysRate, goodDays, hardDays } = relation;
  if (goodDaysRate === null || hardDaysRate === null) return 'notEnough';
  if (goodDays < RELATION_MIN_DAYS || hardDays < RELATION_MIN_DAYS) return 'notEnough';
  return goodDaysRate - hardDaysRate >= RELATION_MIN_GAP ? 'habitsLift' : 'noClearLink';
}

// Haftalık bakış (son 7 gün ile önceki 7 gün)
export interface WeekReview {
  readonly from: string;
  readonly to: string;
  readonly days: readonly { readonly date: string; readonly pct: number }[];
  readonly averagePct: number;
  readonly previousPct: number;
  readonly delta: number;
  // En yüksek oranlı gün (eşitlikte en yenisi); hiç kayıt yoksa null
  readonly bestDay: {
    readonly date: string;
    readonly pct: number;
    readonly score: number | null;
  } | null;
  readonly averageScore: number | null;
}

export function weekReview(
  history: readonly DatedHabitCheck[],
  checkIns: readonly DailyCheckIn[],
  activeIds: ReadonlySet<string>,
  today: string,
): WeekReview {
  const from = addDays(today, -6);
  const days = daysInRange(from, today).map((date) => ({
    date,
    pct: completionPct(history, activeIds, date),
  }));
  const averagePctValue = averagePct(history, activeIds, daysInRange(from, today));
  const previousPct = averagePct(
    history,
    activeIds,
    daysInRange(addDays(from, -7), addDays(from, -1)),
  );
  const scores = balanceScores(checkIns);
  const best = days.reduce<(typeof days)[number] | null>(
    (top, day) => (day.pct > 0 && (!top || day.pct >= top.pct) ? day : top),
    null,
  );
  const weekScores = days
    .map((day) => scores.get(day.date))
    .filter((score): score is number => score !== undefined);
  return {
    from,
    to: today,
    days,
    averagePct: averagePctValue,
    previousPct,
    delta: averagePctValue - previousPct,
    bestDay: best ? { ...best, score: scores.get(best.date) ?? null } : null,
    averageScore:
      weekScores.length > 0
        ? Math.round(weekScores.reduce((sum, score) => sum + score, 0) / weekScores.length)
        : null,
  };
}

// Ay aynası: ayın başından bugüne
export interface MonthMirror {
  readonly year: number;
  readonly month: number; // 1-12
  readonly days: readonly { readonly date: string; readonly pct: number }[];
  readonly urgesPassed: number;
  readonly checkInDays: number;
  readonly fullDays: number; // halkası %100 olan gün
  readonly bestStreak: number; // en az bir alışkanlığın yapıldığı en uzun ardışık gün
}

export function monthMirror(
  history: readonly DatedHabitCheck[],
  checkIns: readonly DailyCheckIn[],
  urges: readonly UrgeLog[],
  activeIds: ReadonlySet<string>,
  today: string,
): MonthMirror {
  const from = `${today.slice(0, 8)}01`;
  const days = daysInRange(from, today).map((date) => ({
    date,
    pct: completionPct(history, activeIds, date),
  }));
  const activeDays = new Set(
    history.filter((entry) => inRange(entry.date, from, today) && isDone(entry)).map((e) => e.date),
  );
  let bestStreak = 0;
  let run = 0;
  for (const day of days) {
    run = activeDays.has(day.date) ? run + 1 : 0;
    bestStreak = Math.max(bestStreak, run);
  }
  return {
    year: Number(today.slice(0, 4)),
    month: Number(today.slice(5, 7)),
    days,
    urgesPassed: urges.filter((u) => inRange(u.date, from, today) && u.outcome === 'passed').length,
    checkInDays: checkIns.filter((checkIn) => inRange(checkIn.date, from, today)).length,
    fullDays: days.filter((day) => day.pct >= 100).length,
    bestStreak,
  };
}

// Bugünün çubukları (0-100): su, görevler, odak (günlük hedef 4 seans), ruh hali (check-in puanı)
export const FOCUS_DAILY_TARGET = 4;

export interface TodayBars {
  readonly water: number;
  readonly tasks: number;
  readonly focus: number;
  readonly mood: number | null;
}

const pctOf = (value: number, total: number) =>
  total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;

export function todayBars(
  values: {
    waterMl: number;
    waterTargetMl: number;
    tasksDone: number;
    tasksTotal: number;
    focusSessions: number;
  },
  rating: number | null,
): TodayBars {
  return {
    water: pctOf(values.waterMl, values.waterTargetMl),
    tasks: pctOf(values.tasksDone, values.tasksTotal),
    focus: pctOf(values.focusSessions, FOCUS_DAILY_TARGET),
    mood: rating === null ? null : Math.round(((rating - 1) / 4) * 100),
  };
}

// Günlük özet ortalamaları (aralıkta kaydı olan günler); kayıt yoksa null
export interface LogAverages {
  readonly days: number;
  readonly waterPct: number | null;
  readonly focusSessions: number | null;
}

export function logAverages(
  logs: readonly { date: string; waterMl: number; waterTargetMl: number; focusSessions: number }[],
  from: string,
  to: string,
): LogAverages {
  const ranged = logs.filter((log) => inRange(log.date, from, to));
  if (ranged.length === 0) return { days: 0, waterPct: null, focusSessions: null };
  const water = ranged.reduce((sum, log) => sum + pctOf(log.waterMl, log.waterTargetMl), 0);
  const focus = ranged.reduce((sum, log) => sum + log.focusSessions, 0);
  return {
    days: ranged.length,
    waterPct: Math.round(water / ranged.length),
    focusSessions: Math.round((focus / ranged.length) * 10) / 10,
  };
}
