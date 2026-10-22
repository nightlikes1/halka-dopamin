// Gün notu ve takvimdeki gün özeti
import type { DailyBalance } from '@features/checkin/domain/balance';
import type { DailyCheckIn } from '@features/checkin/domain/entities';

export const DAY_NOTE_MAX_LENGTH = 280;

export interface DayNote {
  readonly date: string; // YYYY-MM-DD (yerel)
  readonly text: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface DaySummary {
  readonly date: string;
  readonly inMonth: boolean; // takvimde önceki/sonraki aya taşan gün mü
  readonly isToday: boolean;
  readonly isFuture: boolean;
  readonly checkIn: DailyCheckIn | null;
  readonly balance: DailyBalance | null;
  readonly troubled: boolean;
  readonly note: DayNote | null;
}
