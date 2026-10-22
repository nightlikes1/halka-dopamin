// Su takibi ViewModel'i
import { useCallback, useMemo } from 'react';
import { getWaterProgress } from '@domain/entities/Water';
import { useSoundEffect } from '@presentation/hooks/useSoundEffect';
import { useDI } from '@presentation/providers/DIProvider';
import { useHalkaStore, useSnapshotSlice } from '@presentation/store/useHalkaStore';
import { handleResult } from '@presentation/utils/handleResult';

export function useWater() {
  const water = useSnapshotSlice('water');
  const patch = useHalkaStore((s) => s.patch);
  const { water: useCases } = useDI();
  const play = useSoundEffect();

  const progress = useMemo(() => getWaterProgress(water), [water]);

  const add = useCallback(
    async (amountMl: number) => {
      handleResult(await useCases.add.execute(amountMl), (value) => {
        patch('water', value);
        play('waterDrop');
      });
    },
    [useCases, patch, play],
  );

  const reset = useCallback(async () => {
    handleResult(await useCases.reset.execute(), (value) => {
      patch('water', value);
      play('click');
    });
  }, [useCases, patch, play]);

  return { water, progress, add, reset };
}
