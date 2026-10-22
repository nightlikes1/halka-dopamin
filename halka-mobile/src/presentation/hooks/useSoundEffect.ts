// Ses efekti çalmak için kısa yol (hata kullanıcıya gösterilmez)
import { useCallback } from 'react';
import type { SoundEffect } from '@domain/entities/Audio';
import { useDI } from '@presentation/providers/DIProvider';

export function useSoundEffect(): (effect: SoundEffect) => void {
  const { audio } = useDI();
  return useCallback(
    (effect: SoundEffect) => {
      const result = audio.playEffect.execute(effect);
      if (!result.ok && __DEV__) console.warn(result.error.message);
    },
    [audio],
  );
}
