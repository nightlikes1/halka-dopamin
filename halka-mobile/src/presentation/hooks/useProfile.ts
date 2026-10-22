// Profil: isim, görünüm modu ve ses tercihi
import { useCallback } from 'react';
import { useSoundEffect } from '@presentation/hooks/useSoundEffect';
import { useDI } from '@presentation/providers/DIProvider';
import { useHalkaStore, useSnapshotSlice } from '@presentation/store/useHalkaStore';
import { useUiStore } from '@presentation/store/useUiStore';
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

  const toggleViewMode = useCallback(async () => {
    play('click');
    const next = profile.viewMode === 'grid' ? 'cockpit' : 'grid';
    handleResult(await useCases.changeViewMode.execute(next), (value) => patch('profile', value));
  }, [useCases, patch, play, profile.viewMode]);

  const toggleSound = useCallback(async () => {
    handleResult(await useCases.toggleSound.execute(), (value) => {
      patch('profile', value);
      if (!value.soundEnabled) setCurrentAmbient(null);
    });
  }, [useCases, patch, setCurrentAmbient]);

  return { profile, rename, toggleViewMode, toggleSound };
}
