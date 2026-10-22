// Pomodoro ViewModel'i ve uygulama genelinde süre bitimini izleyen hook
import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import {
  getRemainingSeconds,
  isPomodoroFinished,
  isPomodoroRunning,
  type PomodoroMode,
} from '@domain/entities/Pomodoro';
import { useNow } from '@presentation/hooks/useNow';
import { useSoundEffect } from '@presentation/hooks/useSoundEffect';
import { useDI } from '@presentation/providers/DIProvider';
import { useHalkaStore, useSnapshotSlice } from '@presentation/store/useHalkaStore';
import { handleResult } from '@presentation/utils/handleResult';

export function usePomodoro() {
  const pomodoro = useSnapshotSlice('pomodoro');
  const patch = useHalkaStore((s) => s.patch);
  const { pomodoro: useCases } = useDI();
  const play = useSoundEffect();

  const isRunning = isPomodoroRunning(pomodoro);
  const now = useNow(1000, isRunning);
  const remainingSeconds = getRemainingSeconds(pomodoro, now.getTime());

  const toggle = useCallback(async () => {
    play('click');
    const useCase = isPomodoroRunning(pomodoro) ? useCases.pause : useCases.start;
    handleResult(await useCase.execute(), (value) => patch('pomodoro', value));
  }, [pomodoro, useCases, patch, play]);

  const reset = useCallback(async () => {
    play('click');
    handleResult(await useCases.reset.execute(), (value) => patch('pomodoro', value));
  }, [useCases, patch, play]);

  const changeMode = useCallback(
    async (mode: PomodoroMode) => {
      play('click');
      handleResult(await useCases.changeMode.execute(mode), (value) => patch('pomodoro', value));
    },
    [useCases, patch, play],
  );

  return { pomodoro, isRunning, remainingSeconds, toggle, reset, changeMode };
}

// Kök bileşende bir kez kullanılır: eklenti ekranda olmasa bile seansı tamamlar
export function usePomodoroCompletionWatcher(): void {
  const pomodoro = useSnapshotSlice('pomodoro');
  const patch = useHalkaStore((s) => s.patch);
  const { pomodoro: useCases, clock } = useDI();
  const play = useSoundEffect();
  const completing = useRef(false);

  useEffect(() => {
    if (!isPomodoroRunning(pomodoro)) return undefined;

    const check = async () => {
      if (completing.current || !isPomodoroFinished(pomodoro, clock.now().getTime())) return;
      completing.current = true;
      const result = await useCases.complete.execute();
      completing.current = false;
      if (result.ok) {
        patch('pomodoro', result.value);
        play('chime');
      }
    };

    void check();
    const timer = setInterval(() => void check(), 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void check();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [pomodoro, useCases, clock, patch, play]);
}
