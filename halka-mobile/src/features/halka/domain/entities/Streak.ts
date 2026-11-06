// Zinciri kırma (alışkanlık serisi)
// Seri, işaretlenen günlerin listesinden hesaplanır; böylece gün atlanınca zincir kendiliğinden kırılır.
import { addDays } from '@core/utils/date';

export interface Streak {
  readonly habitName: string;
  readonly bestStreak: number;
  // İşaretlenen günler (YYYY-MM-DD), artan sırada ve tekrarsız
  readonly checkedDates: readonly string[];
}

export interface StreakDay {
  readonly date: string;
  readonly done: boolean;
}

export const STREAK_HISTORY_DAYS = 7;
export const STREAK_MAX_STORED_DATES = 120;

export function hasCheckedInOn(streak: Streak, isoDate: string): boolean {
  return streak.checkedDates.includes(isoDate);
}

// Bugün işaretlenmediyse dünden geriye doğru sayar (gün henüz bitmedi)
export function getCurrentStreak(streak: Streak, today: string): number {
  const checked = new Set(streak.checkedDates);
  let cursor = checked.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (checked.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

// Bugün dahil son 7 günün durumu (eskiden yeniye)
export function getStreakHistory(streak: Streak, today: string): StreakDay[] {
  const checked = new Set(streak.checkedDates);
  const days: StreakDay[] = [];
  for (let offset = STREAK_HISTORY_DAYS - 1; offset >= 0; offset -= 1) {
    const date = addDays(today, -offset);
    days.push({ date, done: checked.has(date) });
  }
  return days;
}
