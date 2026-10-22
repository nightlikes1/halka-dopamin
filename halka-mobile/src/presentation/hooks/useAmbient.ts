// Ortam sesleri ViewModel'i
import { useCallback } from 'react';
import type { AmbientType } from '@domain/entities/Audio';
import { useDI } from '@presentation/providers/DIProvider';
import { useUiStore } from '@presentation/store/useUiStore';
import { handleResult } from '@presentation/utils/handleResult';

export function useAmbient() {
  const current = useUiStore((s) => s.currentAmbient);
  const setCurrent = useUiStore((s) => s.setCurrentAmbient);
  const { audio } = useDI();

  const toggle = useCallback(
    async (type: AmbientType) => {
      handleResult(await audio.toggleAmbient.execute(type), (playing) => setCurrent(playing));
    },
    [audio, setCurrent],
  );

  const stop = useCallback(async () => {
    handleResult(await audio.stopAmbient.execute(), () => setCurrent(null));
  }, [audio, setCurrent]);

  return { current, isPlaying: current !== null, toggle, stop };
}
