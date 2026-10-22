// Merkezdeki günlük özet (dakikada bir ve veri değiştikçe yenilenir)
import { useMemo } from 'react';
import type { DailyBriefing } from '@domain/entities/Briefing';
import { useNow } from '@presentation/hooks/useNow';
import { useDI } from '@presentation/providers/DIProvider';
import { useHalkaStore } from '@presentation/store/useHalkaStore';

export function useBriefing(): DailyBriefing {
  const snapshot = useHalkaStore((s) => s.snapshot);
  const { briefing } = useDI();
  const now = useNow(60_000);
  return useMemo(() => briefing.generate.execute(snapshot, now), [briefing, snapshot, now]);
}
