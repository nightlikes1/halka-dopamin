// Aktivite repository sözleşmeleri (implementasyon: Faz 1, HTTP API)
import type { AsyncResult } from '@core/result/Result';
import type {
  ActivityDefinition,
  ActivityLog,
  Baseline,
  RunningTimer,
} from '@features/activities/domain/entities';

export interface DateRange {
  readonly from: string; // ISO
  readonly to: string; // ISO
}

export interface ActivityRepository {
  listDefinitions(): AsyncResult<readonly ActivityDefinition[]>;
  saveDefinition(definition: ActivityDefinition): AsyncResult<ActivityDefinition>;
  archiveDefinition(id: string): AsyncResult<void>;
}

export interface ActivityLogRepository {
  listLogs(range: DateRange): AsyncResult<readonly ActivityLog[]>;
  saveLog(log: ActivityLog): AsyncResult<ActivityLog>;
  deleteLog(id: string): AsyncResult<void>;
}

export interface TimerRepository {
  getRunning(): AsyncResult<RunningTimer | null>;
  start(timer: RunningTimer): AsyncResult<RunningTimer>;
  stop(): AsyncResult<void>;
}

export interface BaselineRepository {
  list(): AsyncResult<readonly Baseline[]>;
  save(baseline: Baseline): AsyncResult<Baseline>;
}
