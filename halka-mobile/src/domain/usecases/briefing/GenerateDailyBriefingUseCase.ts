// Merkezdeki günlük özeti üretir
import type { DailyBriefing } from '@domain/entities/Briefing';
import type { HalkaSnapshot } from '@domain/entities/HalkaSnapshot';
import type { Clock } from '@domain/ports/Clock';
import { generateDailyBriefing } from '@domain/services/briefingGenerator';

export class GenerateDailyBriefingUseCase {
  constructor(private readonly clock: Clock) {}

  // now verilmezse saat kaynağından alınır
  execute(snapshot: HalkaSnapshot, now: Date = this.clock.now()): DailyBriefing {
    return generateDailyBriefing(snapshot, now);
  }
}
