// Halka eklentilerinin bugünkü değerlerini (su, görev, odak seansı) değiştikçe cihazdaki günlük
// özete yazar; Gelişim'in haftalık karşılaştırmaları buradan beslenir.
import { useEffect } from 'react';
import { getTaskProgress } from '@features/halka/domain/entities/Task';
import { useHalkaStore } from '@features/halka/presentation/store/useHalkaStore';
import { useDI } from '@presentation/providers/DIProvider';

// Art arda dokunuşlarda tek kayıt
const DEBOUNCE_MS = 1500;

export function useDailyLogSync(): void {
  const { stats } = useDI();
  const ready = useHalkaStore((s) => s.status === 'ready');
  const waterMl = useHalkaStore((s) => s.snapshot.water.current);
  const waterTargetMl = useHalkaStore((s) => s.snapshot.water.target);
  const tasks = useHalkaStore((s) => s.snapshot.tasks);
  const focusSessions = useHalkaStore((s) => s.snapshot.pomodoro.completedSessions);
  const { done: tasksDone, total: tasksTotal } = getTaskProgress(tasks);

  useEffect(() => {
    if (!ready) return undefined;
    const timer = setTimeout(() => {
      void stats.recordDay.execute({
        waterMl,
        waterTargetMl,
        tasksDone,
        tasksTotal,
        focusSessions,
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [ready, stats, waterMl, waterTargetMl, tasksDone, tasksTotal, focusSessions]);
}
