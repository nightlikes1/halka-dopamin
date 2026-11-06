// Belirli aralıklarla güncellenen "şimdi" değeri
import { useEffect, useState } from 'react';
import { useDI } from '@presentation/providers/DIProvider';

export function useNow(intervalMs: number, enabled = true): Date {
  const { clock } = useDI();
  const [now, setNow] = useState<Date>(() => clock.now());
  const [wasEnabled, setWasEnabled] = useState(enabled);

  // Etkinleşince bayat değerle tek kare bile çizilmez (ör. Pomodoro başlarken 25:00 → 25:32 zıplaması)
  if (enabled !== wasEnabled) {
    setWasEnabled(enabled);
    if (enabled) setNow(clock.now());
  }

  useEffect(() => {
    if (!enabled) return undefined;
    const timer = setInterval(() => setNow(clock.now()), intervalMs);
    return () => clearInterval(timer);
  }, [clock, intervalMs, enabled]);

  return now;
}
