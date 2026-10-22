// Zincir (seri) kuralları
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type Result } from '@core/result/Result';
import {
  getCurrentStreak,
  hasCheckedInOn,
  STREAK_MAX_STORED_DATES,
  type Streak,
} from '@domain/entities/Streak';

// Bugünü zincire ekler; aynı gün ikinci kez eklenemez
export function checkInStreak(streak: Streak, today: string): Result<Streak> {
  if (hasCheckedInOn(streak, today)) {
    return err(new ValidationFailure('Bugünkü halka zaten eklendi.'));
  }
  const checkedDates = [...streak.checkedDates, today].sort().slice(-STREAK_MAX_STORED_DATES);
  const next: Streak = { ...streak, checkedDates };
  const current = getCurrentStreak(next, today);
  return ok({ ...next, bestStreak: Math.max(streak.bestStreak, current) });
}
