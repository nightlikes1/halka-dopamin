// Check-in repository sözleşmesi (implementasyon: HTTP API)
import type { AsyncResult } from '@core/result/Result';
import type {
  CheckInInput,
  DailyCheckIn,
  DatedHabitCheck,
} from '@features/checkin/domain/entities';
import type { HabitEntryStatus } from '@features/habits/domain/entities';

export interface CheckInRepository {
  get(date: string): AsyncResult<DailyCheckIn | null>;
  listRange(from: string, to: string): AsyncResult<readonly DailyCheckIn[]>;
  // Aynı gün için tekrar çağrılırsa günceller
  save(date: string, input: CheckInInput): AsyncResult<DailyCheckIn>;
}

// Gün içi alışkanlık işaretleme (implementasyon: HTTP API /habit-entries)
export interface HabitEntryRepository {
  listRange(from: string, to: string): AsyncResult<readonly DatedHabitCheck[]>;
  mark(date: string, habitId: string, status: HabitEntryStatus): AsyncResult<void>;
  clear(date: string, habitId: string): AsyncResult<void>;
}
