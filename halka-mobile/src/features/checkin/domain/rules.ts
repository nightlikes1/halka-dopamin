// Check-in kuralları: tarih penceresi ve girdi doğrulama (saf fonksiyonlar)
import { ValidationFailure } from '@core/errors/Failure';
import { err, okVoid, type Result } from '@core/result/Result';
import { addDays } from '@core/utils/date';
import { isDayRating, type CheckInInput } from '@features/checkin/domain/entities';
import { STATUSES_BY_KIND, type Habit } from '@features/habits/domain/entities';

export type CheckInDay = 'today' | 'yesterday';

// Check-in bugün için ve (yapılmadıysa) dün için açıktır
export function resolveCheckInDay(date: string, today: string): CheckInDay | null {
  if (date === today) return 'today';
  if (date === addDays(today, -1)) return 'yesterday';
  return null;
}

export function validateCheckInInput(input: CheckInInput, habits: readonly Habit[]): Result<void> {
  if (!isDayRating(input.rating)) {
    return err(new ValidationFailure('Günün puanını 1 ile 5 arasında seç.'));
  }
  const seen = new Set<string>();
  const byId = new Map(habits.map((habit) => [habit.id, habit]));
  for (const entry of input.entries) {
    if (seen.has(entry.habitId)) {
      return err(new ValidationFailure('Aynı alışkanlık iki kez cevaplanamaz.'));
    }
    seen.add(entry.habitId);
    const habit = byId.get(entry.habitId);
    if (!habit) return err(new ValidationFailure('Alışkanlık bulunamadı.'));
    if (!STATUSES_BY_KIND[habit.kind].includes(entry.status)) {
      return err(new ValidationFailure('Alışkanlık türü ile cevap uyumsuz.'));
    }
  }
  return okVoid();
}
