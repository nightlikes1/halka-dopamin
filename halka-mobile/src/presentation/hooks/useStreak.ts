// Zinciri kırma ViewModel'i
import { useCallback, useMemo } from 'react';
import { toIsoDate } from '@core/utils/date';
import { getCurrentStreak, getStreakHistory, hasCheckedInOn } from '@domain/entities/Streak';
import { useNow } from '@presentation/hooks/useNow';
import { useSoundEffect } from '@presentation/hooks/useSoundEffect';
import { useDI } from '@presentation/providers/DIProvider';
import { useHalkaStore, useSnapshotSlice } from '@presentation/store/useHalkaStore';
import { handleResult } from '@presentation/utils/handleResult';

export function useStreak() {
  const streak = useSnapshotSlice('streak');
  const patch = useHalkaStore((s) => s.patch);
  const { streak: useCases } = useDI();
  const play = useSoundEffect();
  const today = toIsoDate(useNow(60_000));

  const view = useMemo(
    () => ({
      currentStreak: getCurrentStreak(streak, today),
      history: getStreakHistory(streak, today),
      checkedInToday: hasCheckedInOn(streak, today),
    }),
    [streak, today],
  );

  const checkIn = useCallback(async () => {
    handleResult(await useCases.checkIn.execute(), (value) => {
      patch('streak', value);
      play('chainPulse');
    });
  }, [useCases, patch, play]);

  return { streak, ...view, checkIn };
}
