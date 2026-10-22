// Belirli aralıklarla güncellenen "şimdi" değeri
import { useEffect, useState } from 'react';
import { useDI } from '@presentation/providers/DIProvider';

export function useNow(intervalMs: number, enabled = true): Date {
  const { clock } = useDI();
  const [now, setNow] = useState<Date>(() => clock.now());

  useEffect(() => {
    if (!enabled) return undefined;
    const tick = () => setNow(clock.now());
    // Etkinleşince bayat değeri hemen tazele, sonra düzenli aralıklarla güncelle
    const immediate = setTimeout(tick, 0);
    const timer = setInterval(tick, intervalMs);
    return () => {
      clearTimeout(immediate);
      clearInterval(timer);
    };
  }, [clock, intervalMs, enabled]);

  return now;
}
