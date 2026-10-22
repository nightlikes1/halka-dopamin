// Ruh hali ve enerji ViewModel'i
import { useCallback } from 'react';
import type { MoodId } from '@domain/entities/Mood';
import { useSoundEffect } from '@presentation/hooks/useSoundEffect';
import { useDI } from '@presentation/providers/DIProvider';
import { useHalkaStore, useSnapshotSlice } from '@presentation/store/useHalkaStore';
import { handleResult } from '@presentation/utils/handleResult';

export function useMood() {
  const mood = useSnapshotSlice('mood');
  const patch = useHalkaStore((s) => s.patch);
  const { mood: useCases } = useDI();
  const play = useSoundEffect();

  const setMood = useCallback(
    async (moodId: MoodId) => {
      handleResult(await useCases.setMood.execute(moodId), (value) => {
        patch('mood', value);
        play('click');
      });
    },
    [useCases, patch, play],
  );

  const setEnergy = useCallback(
    async (level: number) => {
      handleResult(await useCases.setEnergy.execute(level), (value) => patch('mood', value));
    },
    [useCases, patch],
  );

  const setReflection = useCallback(
    async (text: string) => {
      handleResult(await useCases.setReflection.execute(text), (value) => patch('mood', value));
    },
    [useCases, patch],
  );

  return { mood, setMood, setEnergy, setReflection };
}
