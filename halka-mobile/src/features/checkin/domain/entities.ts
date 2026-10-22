// Akşam check-in varlıkları
import type { HabitEntryStatus } from '@features/habits/domain/entities';

export type DayRating = 1 | 2 | 3 | 4 | 5;

export const DAY_RATINGS: readonly DayRating[] = [1, 2, 3, 4, 5];

export interface HabitCheck {
  readonly habitId: string;
  readonly status: HabitEntryStatus;
}

export interface DailyCheckIn {
  readonly date: string; // YYYY-MM-DD (yerel)
  readonly rating: DayRating;
  readonly entries: readonly HabitCheck[];
  readonly completedAt: string;
  readonly updatedAt: string;
}

// Kaydedilecek cevaplar (cevaplanmayan alışkanlıklar listede yer almaz)
export interface CheckInInput {
  readonly rating: number;
  readonly entries: readonly HabitCheck[];
}

export const isDayRating = (value: number): value is DayRating =>
  Number.isInteger(value) && value >= 1 && value <= 5;

// Gün içinde tek tek işaretlenen alışkanlık cevabı (check-in'den bağımsız kaydedilir)
export interface DatedHabitCheck extends HabitCheck {
  readonly date: string;
}
