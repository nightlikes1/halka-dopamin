// Bugün ekranının özet halkaları: alışkanlık oranı (dış) ve odak hedefi (iç).
// Yalnızca sunum hesabı; kaynak veriler check-in cevapları ve Pomodoro durumu.
import type { HabitCheck } from '@features/checkin/domain/entities';
import type { Habit } from '@features/habits/domain/entities';

export interface TodaySummary {
  readonly done: number;
  readonly total: number;
  readonly habitPct: number; // 0-100
  readonly focusMinutes: number;
  readonly focusGoalMinutes: number;
  readonly focusPct: number; // 0-100
}

const pct = (part: number, whole: number) =>
  whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0;

// Yapıldı sayılan cevaplar: iyi alışkanlıkta "done", kötüde "clean"
export const isCompleted = (status: HabitCheck['status'] | undefined): boolean =>
  status === 'done' || status === 'clean';

export function summarizeToday(input: {
  readonly habits: readonly Habit[];
  readonly entries: readonly HabitCheck[];
  readonly completedSessions: number;
  readonly sessionMinutes: number;
  readonly sessionsGoal: number;
}): TodaySummary {
  const active = new Set(input.habits.map((habit) => habit.id));
  const done = input.entries.filter(
    (entry) => active.has(entry.habitId) && isCompleted(entry.status),
  ).length;
  const total = input.habits.length;
  const focusMinutes = input.completedSessions * input.sessionMinutes;
  const focusGoalMinutes = input.sessionsGoal * input.sessionMinutes;
  return {
    done,
    total,
    habitPct: pct(done, total),
    focusMinutes,
    focusGoalMinutes,
    focusPct: pct(focusMinutes, focusGoalMinutes),
  };
}
