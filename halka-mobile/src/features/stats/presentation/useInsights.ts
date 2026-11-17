// Gelişim, Haftalık bakış ve Ay aynası için ortak ViewModel: veriyi odakta yükler, içgörüleri
// saf fonksiyonlarla hesaplar. Bugünün su/görev/odak değerleri canlı Halka deposundan okunur.
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { addDays } from '@core/utils/date';
import { getTaskProgress } from '@features/halka/domain/entities/Task';
import { useHalkaStore } from '@features/halka/presentation/store/useHalkaStore';
import { isPendingHabit } from '@features/habits/domain/entities';
import { useHabits } from '@features/habits/presentation/useHabits';
import {
  balanceScores,
  dopamineBalance,
  logAverages,
  monthMirror,
  moodRelation,
  todayBars,
  urgePattern,
  weekReview,
} from '@features/stats/domain/insights';
import type { InsightsData } from '@features/stats/domain/usecases/StatsUseCases';
import { activityStreak, urgeStats } from '@features/today/domain/dayRules';
import { useDI } from '@presentation/providers/DIProvider';

const PATTERN_DAYS = 30;

export function useInsights() {
  const { stats } = useDI();
  const { habits } = useHabits();
  const [data, setData] = useState<InsightsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const water = useHalkaStore((s) => s.snapshot.water);
  const tasks = useHalkaStore((s) => s.snapshot.tasks);
  const focusSessions = useHalkaStore((s) => s.snapshot.pomodoro.completedSessions);

  useFocusEffect(
    useCallback(() => {
      void stats.insights.execute().then((result) => {
        if (result.ok) {
          setData(result.value);
          setError(null);
        } else setError(result.error.message);
      });
    }, [stats]),
  );

  const activeIds = useMemo(
    () => new Set(habits.filter((habit) => !isPendingHabit(habit)).map((habit) => habit.id)),
    [habits],
  );

  const insights = useMemo(() => {
    if (!data) return null;
    const { today, checkIns, entries, urges, logs } = data;
    const week = weekReview(entries, checkIns, activeIds, today);
    const patternFrom = addDays(today, -(PATTERN_DAYS - 1));
    const todayCheckIn = checkIns.find((checkIn) => checkIn.date === today) ?? null;
    const previousFrom = addDays(week.from, -7);
    const previousTo = addDays(week.from, -1);
    return {
      today,
      week,
      todayScore: balanceScores(checkIns).get(today) ?? null,
      balance: dopamineBalance(entries, urges, week.from, today),
      pattern: urgePattern(urges, patternFrom, today),
      weekPattern: urgePattern(urges, week.from, today),
      mood: moodRelation(checkIns.filter((checkIn) => checkIn.date >= patternFrom)),
      mirror: monthMirror(entries, checkIns, urges, activeIds, today),
      streak: activityStreak(entries, today),
      urgesPassed: urgeStats(urges, today).passedThisWeek,
      completed: entries.filter(
        (entry) =>
          entry.date >= week.from &&
          activeIds.has(entry.habitId) &&
          (entry.status === 'done' || entry.status === 'clean'),
      ).length,
      logs: logAverages(logs, week.from, today),
      previousLogs: logAverages(logs, previousFrom, previousTo),
      rating: todayCheckIn?.rating ?? null,
    };
  }, [data, activeIds]);

  const { done: tasksDone, total: tasksTotal } = getTaskProgress(tasks);
  const bars = todayBars(
    { waterMl: water.current, waterTargetMl: water.target, tasksDone, tasksTotal, focusSessions },
    insights?.rating ?? null,
  );

  return { insights, bars, error, loading: data === null && error === null };
}
