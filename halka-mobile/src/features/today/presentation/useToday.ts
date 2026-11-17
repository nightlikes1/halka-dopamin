// Bugün ekranı ViewModel'i: alışkanlıklar + bugünün cevapları (sunucu), seri için geçmiş, cihazdaki
// dürtü / mini hal kayıtları ve örnek Çember. Tamamlama, mini hal ve arşiv 4 sn geri alınabilir.
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { strings } from '@core/i18n/tr';
import { todayOf } from '@core/utils/clock';
import type { DatedHabitCheck } from '@features/checkin/domain/entities';
import {
  isPendingHabit,
  type Habit,
  type HabitEntryStatus,
} from '@features/habits/domain/entities';
import { useHabits } from '@features/habits/presentation/useHabits';
import {
  EMPTY_TODAY_STATE,
  type Circle,
  type TodayLocalState,
} from '@features/today/domain/entities';
import {
  UNDO_MS,
  activityStreak,
  cleanStreak,
  dayProgress,
  doneStatusFor,
  isCompleted,
  isDayComplete,
  mergeToday,
  ringMood,
} from '@features/today/domain/dayRules';
import { useTodayHabits } from '@features/today/presentation/useTodayHabits';
import { useUndo } from '@presentation/hooks/useUndo';
import { useDI } from '@presentation/providers/DIProvider';
import { hapticLight } from '@presentation/utils/haptics';

const t = strings.today;

export function useToday() {
  const { today: useCases, clock } = useDI();
  const { archiveHabit } = useHabits();
  const { habits, entries, date, statusOf, mark, error, isEmpty } = useTodayHabits();
  const [history, setHistory] = useState<readonly DatedHabitCheck[]>([]);
  const [local, setLocal] = useState<TodayLocalState>(EMPTY_TODAY_STATE);
  const [localReady, setLocalReady] = useState(false);
  const [circle, setCircle] = useState<Circle | null>(null);
  // Arşivi geri alma süresi dolana kadar gizlenen satırlar
  const [hiddenIds, setHiddenIds] = useState<readonly string[]>([]);
  const [celebrating, setCelebrating] = useState(false);
  const undo = useUndo(UNDO_MS);

  const day = date ?? todayOf(clock);

  const reloadLocal = useCallback(async () => {
    const result = await useCases.local.execute();
    if (result.ok) setLocal(result.value);
    setLocalReady(true);
  }, [useCases]);

  useFocusEffect(
    useCallback(() => {
      void reloadLocal();
      void useCases.history.execute().then((result) => {
        if (result.ok) setHistory(result.value);
      });
      void useCases.circle.execute().then((result) => {
        if (result.ok) setCircle(result.value);
      });
    }, [useCases, reloadLocal]),
  );

  const visible = useMemo(
    () => habits.filter((habit) => !hiddenIds.includes(habit.id)),
    [habits, hiddenIds],
  );
  const saved = useMemo(() => visible.filter((habit) => !isPendingHabit(habit)), [visible]);
  const progress = dayProgress(saved, entries);
  const merged = useMemo(() => mergeToday(history, day, entries), [history, day, entries]);
  const streak = activityStreak(merged, day);
  const minis = useMemo(() => new Set(local.minis[day] ?? []), [local, day]);
  const urgesToday = useMemo(() => local.urges.filter((urge) => urge.date === day), [local, day]);
  const mood = ringMood(progress.done, urgesToday);

  const cleanNights = useCallback(
    (habitId: string) => cleanStreak(merged, habitId, day),
    [merged, day],
  );

  const setMini = useCallback(
    async (habitId: string, on: boolean) => {
      await useCases.setMini.execute(habitId, on);
      await reloadLocal();
    },
    [useCases, reloadLocal],
  );

  // Önceki duruma döner (cevap + mini hal)
  const restore = useCallback(
    (habit: Habit, status: HabitEntryStatus | undefined, wasMini: boolean) => {
      void mark(habit, status);
      if (minis.has(habit.id) !== wasMini) void setMini(habit.id, wasMini);
    },
    [mark, minis, setMini],
  );

  const toggle = useCallback(
    (habit: Habit) => {
      if (isPendingHabit(habit)) return;
      const previous = statusOf(habit.id);
      const wasMini = minis.has(habit.id);
      if (isCompleted(previous)) {
        void mark(habit, undefined);
        if (wasMini) void setMini(habit.id, false);
        undo.show({
          message: t.undoUnmark(habit.title),
          undo: () => restore(habit, previous, wasMini),
        });
        return;
      }
      hapticLight();
      void mark(habit, doneStatusFor(habit));
      undo.show({ message: t.undoDone(habit.title), undo: () => restore(habit, previous, false) });
    },
    [statusOf, minis, mark, setMini, undo, restore],
  );

  // Mini hal: alışkanlık yapıldı sayılır (seri ve halka korunur), cihazda "mini" olarak işaretlenir
  const toggleMini = useCallback(
    (habit: Habit) => {
      if (isPendingHabit(habit) || habit.kind !== 'build') return;
      const previous = statusOf(habit.id);
      const wasMini = minis.has(habit.id);
      if (wasMini) {
        void setMini(habit.id, false);
        void mark(habit, undefined);
        undo.show({
          message: t.undoUnmark(habit.title),
          undo: () => restore(habit, previous, true),
        });
        return;
      }
      hapticLight();
      void setMini(habit.id, true);
      void mark(habit, 'done');
      undo.show({ message: t.undoMini(habit.title), undo: () => restore(habit, previous, false) });
    },
    [statusOf, minis, mark, setMini, undo, restore],
  );

  // Arşiv 4 sn ertelenir: bu sürede geri alınırsa sunucuya hiç gitmez
  const archive = useCallback(
    (habit: Habit) => {
      if (isPendingHabit(habit)) return;
      setHiddenIds((ids) => [...ids, habit.id]);
      const unhide = () => setHiddenIds((ids) => ids.filter((id) => id !== habit.id));
      undo.show({
        message: t.undoArchive(habit.title),
        undo: unhide,
        commit: () => {
          void archiveHabit(habit.id).finally(unhide);
        },
      });
    },
    [archiveHabit, undo],
  );

  // Gün tamam kutlaması günde bir kez
  const complete = isDayComplete(progress);
  const shouldCelebrate = complete && localReady && local.celebratedOn !== day;
  useEffect(() => {
    if (!shouldCelebrate) return;
    void useCases.markCelebrated.execute().then(() => {
      setLocal((state) => ({ ...state, celebratedOn: day }));
      setCelebrating(true);
    });
  }, [shouldCelebrate, useCases, day]);

  return {
    day,
    habits: visible,
    statusOf,
    progress,
    streak,
    mood,
    minis,
    cleanNights,
    circle,
    error,
    isEmpty,
    toggle,
    toggleMini,
    archive,
    undo,
    celebrating,
    closeCelebration: () => setCelebrating(false),
    reloadLocal,
  };
}
