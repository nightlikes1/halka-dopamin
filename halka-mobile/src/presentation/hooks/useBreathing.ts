// Kutu nefesi döngüsü (yalnızca ekran durumu; bileşen kapanınca zamanlayıcı temizlenir)
import { useCallback, useEffect, useState } from 'react';
import { BREATHING_PHASES, type BreathingPhase } from '@domain/entities/Breathing';
import { useSoundEffect } from '@presentation/hooks/useSoundEffect';

export function useBreathing() {
  const [phaseIndex, setPhaseIndex] = useState<number | null>(null);
  const play = useSoundEffect();

  useEffect(() => {
    if (phaseIndex === null) return undefined;
    const phase = BREATHING_PHASES[phaseIndex];
    if (!phase) return undefined;
    const timer = setTimeout(
      () =>
        setPhaseIndex((index) => (index === null ? null : (index + 1) % BREATHING_PHASES.length)),
      phase.durationMs,
    );
    return () => clearTimeout(timer);
  }, [phaseIndex]);

  const toggle = useCallback(() => {
    play('click');
    setPhaseIndex((index) => (index === null ? 0 : null));
  }, [play]);

  const phase: BreathingPhase | null =
    phaseIndex === null ? null : (BREATHING_PHASES[phaseIndex] ?? null);

  return { isRunning: phaseIndex !== null, phase, toggle };
}
