// Bugün ekranı alışkanlık ViewModel'i: alışkanlıklar + bugünün işaretleri; dokununca anında
// işaretler (iyimser güncelleme), sunucu hata verirse geri alır.
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import type { HabitCheck } from '@features/checkin/domain/entities';
import type { Habit, HabitEntryStatus } from '@features/habits/domain/entities';
import { useHabits } from '@features/habits/presentation/useHabits';
import { useDI } from '@presentation/providers/DIProvider';

export function useTodayHabits() {
  const { checkIn } = useDI();
  const { habits, reload: reloadHabits } = useHabits();
  const [date, setDate] = useState<string | null>(null);
  const [entries, setEntries] = useState<readonly HabitCheck[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [result] = await Promise.all([checkIn.entries.execute(), reloadHabits()]);
    if (result.ok) {
      setDate(result.value.date);
      setEntries(result.value.entries);
      setError(null);
    } else {
      setError(result.error.message);
    }
  }, [checkIn, reloadHabits]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const statusOf = useCallback(
    (habitId: string) => entries.find((entry) => entry.habitId === habitId)?.status,
    [entries],
  );

  const mark = useCallback(
    async (habit: Habit, status: HabitEntryStatus | undefined) => {
      if (!date) return;
      const previous = entries;
      const rest = entries.filter((entry) => entry.habitId !== habit.id);
      setEntries(status ? [...rest, { habitId: habit.id, status }] : rest);
      const result = await checkIn.mark.execute(date, habit, status);
      if (!result.ok) {
        setEntries(previous);
        setError(result.error.message);
      }
    },
    [checkIn, date, entries],
  );

  return { habits, entries, statusOf, mark, error, reload };
}
