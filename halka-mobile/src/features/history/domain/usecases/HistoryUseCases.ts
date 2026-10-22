// Geçmiş ve gün notu use case'leri
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type AsyncResult } from '@core/result/Result';
import { todayOf, type Clock } from '@domain/ports/Clock';
import type { CheckInRepository } from '@features/checkin/domain/ports';
import {
  buildMonthGrid,
  normalizeNoteText,
  summarizeMonth,
  type MonthRef,
} from '@features/history/domain/calendar';
import type { DayNote, DaySummary } from '@features/history/domain/entities';
import type { DayNoteRepository } from '@features/history/domain/ports';

export interface MonthHistory {
  readonly month: MonthRef;
  readonly today: string;
  readonly days: readonly DaySummary[];
}

// Ayın takvimi: check-in skorları, hatalı günler ve notlar
export class GetMonthHistoryUseCase {
  constructor(
    private readonly checkIns: CheckInRepository,
    private readonly notes: DayNoteRepository,
    private readonly clock: Clock,
  ) {}

  async execute(month: MonthRef): AsyncResult<MonthHistory> {
    const grid = buildMonthGrid(month);
    const from = grid[0];
    const to = grid[grid.length - 1];
    if (!from || !to) return err(new ValidationFailure('Takvim oluşturulamadı.'));

    const [checkIns, notes] = await Promise.all([
      this.checkIns.listRange(from, to),
      this.notes.listRange(from, to),
    ]);
    if (!checkIns.ok) return checkIns;
    if (!notes.ok) return notes;

    const today = todayOf(this.clock);
    return ok({ month, today, days: summarizeMonth(month, today, checkIns.value, notes.value) });
  }
}

export class SaveDayNoteUseCase {
  constructor(
    private readonly notes: DayNoteRepository,
    private readonly clock: Clock,
  ) {}

  async execute(date: string, text: string): AsyncResult<DayNote> {
    if (date > todayOf(this.clock)) {
      return err(new ValidationFailure('Henüz gelmemiş bir güne not yazılamaz.'));
    }
    const normalized = normalizeNoteText(text);
    if (!normalized.ok) return normalized;
    return this.notes.save(date, normalized.value);
  }
}

export class GetDayNoteUseCase {
  constructor(private readonly notes: DayNoteRepository) {}

  async execute(date: string): AsyncResult<DayNote | null> {
    const result = await this.notes.listRange(date, date);
    return result.ok ? ok(result.value[0] ?? null) : result;
  }
}

export class DeleteDayNoteUseCase {
  constructor(private readonly notes: DayNoteRepository) {}

  execute(date: string): AsyncResult<void> {
    return this.notes.delete(date);
  }
}
