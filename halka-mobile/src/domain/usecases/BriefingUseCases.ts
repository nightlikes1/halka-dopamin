// Günlük özet metni
import type { DailyBriefing } from '@domain/entities/Briefing';
import type { HalkaSnapshot } from '@domain/entities/HalkaSnapshot';
import type { Clock } from '@domain/ports';
import { generateDailyBriefing } from '@domain/services/briefingGenerator';

// Merkezdeki günlük özeti üretir
export class GenerateDailyBriefingUseCase {
  constructor(private readonly clock: Clock) {}

  // now verilmezse saat kaynağından alınır
  execute(snapshot: HalkaSnapshot, now: Date = this.clock.now()): DailyBriefing {
    return generateDailyBriefing(snapshot, now);
  }
}
