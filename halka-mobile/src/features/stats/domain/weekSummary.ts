// Gelişim: son 7 günün halka oranları (bugünkü aktif alışkanlıklara göre) ve toplamlar
import { addDays } from '@core/utils/date';
import type { DatedHabitCheck } from '@features/checkin/domain/entities';

export const WEEK_LENGTH = 7;

export interface WeekDay {
  readonly date: string;
  readonly pct: number; // 0-100
}

export interface WeekSummary {
  readonly days: readonly WeekDay[]; // eskiden yeniye
  readonly completed: number;
  readonly averagePct: number;
}

const isDone = (entry: DatedHabitCheck) => entry.status === 'done' || entry.status === 'clean';

export function weekSummary(
  history: readonly DatedHabitCheck[],
  activeHabitIds: readonly string[],
  today: string,
): WeekSummary {
  const active = new Set(activeHabitIds);
  const total = active.size;
  const days: WeekDay[] = [];
  let completed = 0;
  for (let offset = WEEK_LENGTH - 1; offset >= 0; offset -= 1) {
    const date = addDays(today, -offset);
    const done = history.filter(
      (entry) => entry.date === date && active.has(entry.habitId) && isDone(entry),
    ).length;
    completed += done;
    days.push({ date, pct: total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0 });
  }
  const averagePct = Math.round(days.reduce((sum, day) => sum + day.pct, 0) / WEEK_LENGTH);
  return { days, completed, averagePct };
}
