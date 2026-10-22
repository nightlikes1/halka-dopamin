import { summarizeToday } from '@features/activities/presentation/todaySummary';
import type { Habit } from '@features/habits/domain/entities';

const habit = (id: string, kind: Habit['kind'] = 'build'): Habit => ({
  id,
  kind,
  title: id,
  target: { type: 'daily' },
  createdAt: '2026-10-01T00:00:00.000Z',
});

describe('summarizeToday', () => {
  it('yapılan alışkanlık ve odak oranını hesaplar', () => {
    const summary = summarizeToday({
      habits: [habit('a'), habit('b'), habit('c', 'quit'), habit('d')],
      entries: [
        { habitId: 'a', status: 'done' },
        { habitId: 'b', status: 'missed' },
        { habitId: 'c', status: 'clean' },
      ],
      completedSessions: 3,
      sessionMinutes: 25,
      sessionsGoal: 4,
    });
    expect(summary).toEqual({
      done: 2,
      total: 4,
      habitPct: 50,
      focusMinutes: 75,
      focusGoalMinutes: 100,
      focusPct: 75,
    });
  });

  it('arşivlenmiş alışkanlık cevabını saymaz, boş listede %0 verir', () => {
    expect(
      summarizeToday({
        habits: [],
        entries: [{ habitId: 'eski', status: 'done' }],
        completedSessions: 0,
        sessionMinutes: 25,
        sessionsGoal: 4,
      }).habitPct,
    ).toBe(0);
  });

  it('hedefi aşan odak %100 ile sınırlanır', () => {
    const summary = summarizeToday({
      habits: [habit('a')],
      entries: [],
      completedSessions: 6,
      sessionMinutes: 25,
      sessionsGoal: 4,
    });
    expect(summary.focusPct).toBe(100);
    expect(summary.focusMinutes).toBe(150);
  });
});
