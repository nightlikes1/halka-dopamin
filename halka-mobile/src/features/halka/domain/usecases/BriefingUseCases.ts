// Günlük özet metni
import type { DailyBriefing } from '@features/halka/domain/entities/Briefing';
import type { HalkaSnapshot } from '@features/halka/domain/entities/HalkaSnapshot';
import type { Clock } from '@core/utils/clock';
import { generateDailyBriefing } from '@features/halka/domain/services/briefingGenerator';

// Merkezdeki günlük özeti üretir
export class GenerateDailyBriefingUseCase {
  constructor(private readonly clock: Clock) {}

  // now verilmezse saat kaynağından alınır
  execute(snapshot: HalkaSnapshot, now: Date = this.clock.now()): DailyBriefing {
    return generateDailyBriefing(snapshot, now);
  }
}
