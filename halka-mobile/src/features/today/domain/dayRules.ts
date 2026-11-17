// Bugün ekranının saf kuralları: halka ilerlemesi, seri, "N gecedir uzak", canlı halka durumu,
// dürtü istatistikleri ve akşam kapanışının açılma saati.
import { addDays } from '@core/utils/date';
import type { DatedHabitCheck, HabitCheck } from '@features/checkin/domain/entities';
import type { Habit, HabitEntryStatus } from '@features/habits/domain/entities';
import type { UrgeLog } from '@features/today/domain/entities';

// Sunucudan okunan geçmiş (gün); aralık sınırı 62 gün
export const HISTORY_DAYS = 62;
// Akşam kapanışı bu saatten sonra açılır
export const EVENING_HOUR = 19;
// Geri al bildiriminin süresi (ms)
export const UNDO_MS = 4000;

// Yapıldı sayılan cevaplar: iyi alışkanlıkta "done", kötüde "clean"
export const isCompleted = (status: HabitEntryStatus | undefined): boolean =>
  status === 'done' || status === 'clean';

export const doneStatusFor = (habit: Pick<Habit, 'kind'>): HabitEntryStatus =>
  habit.kind === 'build' ? 'done' : 'clean';

export interface DayProgress {
  readonly done: number;
  readonly total: number;
  readonly pct: number; // 0-100
}

export function dayProgress(
  habits: readonly Pick<Habit, 'id'>[],
  entries: readonly HabitCheck[],
): DayProgress {
  const active = new Set(habits.map((habit) => habit.id));
  const done = entries.filter(
    (entry) => active.has(entry.habitId) && isCompleted(entry.status),
  ).length;
  const total = habits.length;
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  return { done, total, pct };
}

// Geçmiş + bugünün güncel cevapları (bugün için geçmişteki kayıtların yerine geçer)
export function mergeToday(
  history: readonly DatedHabitCheck[],
  today: string,
  todayEntries: readonly HabitCheck[],
): DatedHabitCheck[] {
  return [
    ...history.filter((entry) => entry.date !== today),
    ...todayEntries.map((entry) => ({ ...entry, date: today })),
  ];
}

// Ardışık gün sayısı; bugün henüz koşul sağlanmadıysa dünden geriye sayılır (gün bitmedi)
function countBack(today: string, holds: (day: string) => boolean): number {
  let cursor = holds(today) ? today : addDays(today, -1);
  let count = 0;
  while (count <= HISTORY_DAYS && holds(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

// Seri: en az bir alışkanlığın yapıldığı ardışık günler
export function activityStreak(entries: readonly DatedHabitCheck[], today: string): number {
  const days = new Set(entries.filter((e) => isCompleted(e.status)).map((e) => e.date));
  return countBack(today, (day) => days.has(day));
}

// Bırakılan alışkanlıkta "N gecedir uzak": ardışık "clean" günleri
export function cleanStreak(
  entries: readonly DatedHabitCheck[],
  habitId: string,
  today: string,
): number {
  const days = new Set(
    entries.filter((e) => e.habitId === habitId && e.status === 'clean').map((e) => e.date),
  );
  return countBack(today, (day) => days.has(day));
}

// Canlı halka: kalıcı ağırlıklı gün sakin, anlık ağırlıklı gün hareketli.
// Kalıcı = tamamlanan alışkanlık + geçirilen dürtü; anlık = "yaptım" denen dürtü.
export type RingMood = 'calm' | 'lively';

export function ringMood(completed: number, urgesToday: readonly UrgeLog[]): RingMood {
  const passed = urgesToday.filter((urge) => urge.outcome === 'passed').length;
  const did = urgesToday.filter((urge) => urge.outcome === 'did').length;
  return did > completed + passed ? 'lively' : 'calm';
}

export interface UrgeStats {
  // Son 7 günde geçirilen dürtü
  readonly passedThisWeek: number;
  // Sonuçlanan dürtülerde geçirme oranı (0-100); hiç yoksa null
  readonly passRate: number | null;
}

export function urgeStats(urges: readonly UrgeLog[], today: string): UrgeStats {
  const weekStart = addDays(today, -6);
  const week = urges.filter((urge) => urge.date >= weekStart && urge.date <= today);
  const passed = week.filter((urge) => urge.outcome === 'passed').length;
  const decided = week.filter((urge) => urge.outcome !== 'still').length;
  return {
    passedThisWeek: passed,
    passRate: decided > 0 ? Math.round((passed / decided) * 100) : null,
  };
}

export const isEveningOpen = (hour: number): boolean => hour >= EVENING_HOUR;

// Gün tamam: en az bir alışkanlık var ve hepsi yapıldı
export const isDayComplete = (progress: DayProgress): boolean =>
  progress.total > 0 && progress.done >= progress.total;
