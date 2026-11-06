// Profil: isim ve ses tercihi
import { useCallback } from 'react';
import { useSoundEffect } from '@features/halka/presentation/hooks/useSoundEffect';
import { useDI } from '@presentation/providers/DIProvider';
import { useHalkaStore, useSnapshotSlice } from '@features/halka/presentation/store/useHalkaStore';
import { useUiStore } from '@features/halka/presentation/store/useUiStore';
import { handleResult } from '@presentation/utils/handleResult';

export function useProfile() {
  const profile = useSnapshotSlice('profile');
  const patch = useHalkaStore((s) => s.patch);
  const setCurrentAmbient = useUiStore((s) => s.setCurrentAmbient);
  const { profile: useCases } = useDI();
  const play = useSoundEffect();

  const rename = useCallback(
    async (name: string): Promise<boolean> =>
      handleResult(await useCases.updateName.execute(name), (value) => {
        patch('profile', value);
        play('success');
      }),
    [useCases, patch, play],
  );

  const toggleSound = useCallback(async () => {
    handleResult(await useCases.toggleSound.execute(), (value) => {
      patch('profile', value);
      if (!value.soundEnabled) setCurrentAmbient(null);
    });
  }, [useCases, patch, setCurrentAmbient]);

  return { profile, rename, toggleSound };
}
