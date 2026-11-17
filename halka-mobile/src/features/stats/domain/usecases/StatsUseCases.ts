// Gelişim use case'leri: içgörü verisini tek seferde toplar (sunucudan check-in + alışkanlık
// cevapları, cihazdan dürtüler + günlük özetler) ve bugünün özetini kaydeder.
import { ok, type AsyncResult } from '@core/result/Result';
import { type Clock, todayOf } from '@core/utils/clock';
import { addDays } from '@core/utils/date';
import type { DailyCheckIn, DatedHabitCheck } from '@features/checkin/domain/entities';
import type { CheckInRepository, HabitEntryRepository } from '@features/checkin/domain/ports';
import {
  DAILY_LOG_DAYS,
  type DailyLog,
  type DailyLogValues,
} from '@features/stats/domain/entities';
import type { DailyLogRepository } from '@features/stats/domain/ports';
import type { UrgeLog } from '@features/today/domain/entities';
import type { TodayLocalRepository } from '@features/today/domain/ports';

export interface InsightsData {
  readonly today: string;
  readonly checkIns: readonly DailyCheckIn[];
  readonly entries: readonly DatedHabitCheck[];
  readonly urges: readonly UrgeLog[];
  readonly logs: readonly DailyLog[];
}

export class GetInsightsUseCase {
  constructor(
    private readonly checkIns: CheckInRepository,
    private readonly entries: HabitEntryRepository,
    private readonly todayLocal: TodayLocalRepository,
    private readonly logs: DailyLogRepository,
    private readonly clock: Clock,
  ) {}

  async execute(): AsyncResult<InsightsData> {
    const today = todayOf(this.clock);
    const from = addDays(today, -(DAILY_LOG_DAYS - 1));
    const [checkIns, entries, local, logs] = await Promise.all([
      this.checkIns.listRange(from, today),
      this.entries.listRange(from, today),
      this.todayLocal.read(),
      this.logs.list(),
    ]);
    if (!checkIns.ok) return checkIns;
    if (!entries.ok) return entries;
    // Cihaz kayıtları okunamazsa içgörüler sunucu verisiyle yine gösterilir
    return ok({
      today,
      checkIns: checkIns.value,
      entries: entries.value,
      urges: local.ok ? local.value.urges : [],
      logs: logs.ok ? logs.value : [],
    });
  }
}

export class RecordDailyLogUseCase {
  constructor(
    private readonly repository: DailyLogRepository,
    private readonly clock: Clock,
  ) {}

  execute(values: DailyLogValues): AsyncResult<void> {
    return this.repository.upsert({ date: todayOf(this.clock), ...values });
  }
}
