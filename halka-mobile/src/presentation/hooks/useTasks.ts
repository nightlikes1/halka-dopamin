// Günlük görevler ViewModel'i
import { useCallback, useMemo } from 'react';
import { getTaskProgress } from '@domain/entities/Task';
import { useSoundEffect } from '@presentation/hooks/useSoundEffect';
import { useDI } from '@presentation/providers/DIProvider';
import { useHalkaStore, useSnapshotSlice } from '@presentation/store/useHalkaStore';
import { handleResult } from '@presentation/utils/handleResult';

export function useTasks() {
  const tasks = useSnapshotSlice('tasks');
  const patch = useHalkaStore((s) => s.patch);
  const { tasks: useCases } = useDI();
  const play = useSoundEffect();

  const progress = useMemo(() => getTaskProgress(tasks), [tasks]);

  const add = useCallback(
    async (text: string): Promise<boolean> =>
      handleResult(await useCases.add.execute(text), (value) => {
        patch('tasks', value);
        play('click');
      }),
    [useCases, patch, play],
  );

  const toggle = useCallback(
    async (taskId: string, done: boolean) => {
      handleResult(await useCases.toggle.execute(taskId, done), (value) => {
        patch('tasks', value);
        play(done ? 'success' : 'click');
      });
    },
    [useCases, patch, play],
  );

  const remove = useCallback(
    async (taskId: string) => {
      handleResult(await useCases.remove.execute(taskId), (value) => {
        patch('tasks', value);
        play('delete');
      });
    },
    [useCases, patch, play],
  );

  return { items: tasks.items, progress, add, toggle, remove };
}
