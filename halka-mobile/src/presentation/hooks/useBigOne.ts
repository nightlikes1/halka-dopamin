// Günün ana hedefi ViewModel'i
import { useCallback } from 'react';
import { useSoundEffect } from '@presentation/hooks/useSoundEffect';
import { useDI } from '@presentation/providers/DIProvider';
import { useHalkaStore, useSnapshotSlice } from '@presentation/store/useHalkaStore';
import { handleResult } from '@presentation/utils/handleResult';

export function useBigOne() {
  const bigOne = useSnapshotSlice('bigOne');
  const patch = useHalkaStore((s) => s.patch);
  const { bigOne: useCases } = useDI();
  const play = useSoundEffect();

  const toggle = useCallback(async () => {
    handleResult(await useCases.toggle.execute(), (value) => {
      patch('bigOne', value);
      play(value.isCompleted ? 'success' : 'click');
    });
  }, [useCases, patch, play]);

  const updateGoal = useCallback(
    async (goal: string): Promise<boolean> =>
      handleResult(await useCases.updateGoal.execute(goal), (value) => {
        patch('bigOne', value);
        play('click');
      }),
    [useCases, patch, play],
  );

  return { bigOne, toggle, updateGoal };
}
