// Takvim ve geçmiş hesapları (saf fonksiyonlar)
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type Result } from '@core/result/Result';
import { addDays, padTwo, parseIsoDate } from '@core/utils/date';
import { computeDailyBalance, isTroubledDay } from '@features/checkin/domain/balance';
import type { DailyCheckIn } from '@features/checkin/domain/entities';
import {
  DAY_NOTE_MAX_LENGTH,
  type DayNote,
  type DaySummary,
} from '@features/history/domain/entities';

export interface MonthRef {
  readonly year: number;
  readonly month: number; // 1-12
}

export const firstDayOfMonth = ({ year, month }: MonthRef): string => `${year}-${padTwo(month)}-01`;

export const shiftMonth = ({ year, month }: MonthRef, delta: number): MonthRef => {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
};

export const monthOf = (isoDate: string): MonthRef => {
  const date = parseIsoDate(isoDate);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
};

// Pazartesiden başlayan 6x7 ızgara; ay dışı günler de doldurulur
export function buildMonthGrid(ref: MonthRef): string[] {
  const first = firstDayOfMonth(ref);
  const weekday = parseIsoDate(first).getDay(); // 0 = Pazar
  const offsetFromMonday = (weekday + 6) % 7;
  const start = addDays(first, -offsetFromMonday);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function summarizeMonth(
  ref: MonthRef,
  today: string,
  checkIns: readonly DailyCheckIn[],
  notes: readonly DayNote[],
): DaySummary[] {
  const checkInByDate = new Map(checkIns.map((checkIn) => [checkIn.date, checkIn]));
  const noteByDate = new Map(notes.map((note) => [note.date, note]));
  const monthPrefix = firstDayOfMonth(ref).slice(0, 7);

  return buildMonthGrid(ref).map((date) => {
    const checkIn = checkInByDate.get(date) ?? null;
    return {
      date,
      inMonth: date.startsWith(monthPrefix),
      isToday: date === today,
      isFuture: date > today,
      checkIn,
      balance: checkIn ? computeDailyBalance(checkIn) : null,
      troubled: checkIn ? isTroubledDay(checkIn) : false,
      note: noteByDate.get(date) ?? null,
    };
  });
}

// Not metni doğrulama: kırpılır, boş ve 280 karakterden uzun olamaz
export function normalizeNoteText(text: string): Result<string> {
  const trimmed = text.trim();
  if (trimmed.length === 0) return err(new ValidationFailure('Not boş olamaz.'));
  if (trimmed.length > DAY_NOTE_MAX_LENGTH) {
    return err(new ValidationFailure(`Not en fazla ${DAY_NOTE_MAX_LENGTH} karakter olabilir.`));
  }
  return ok(trimmed);
}
