// Gün içi alışkanlık işaretleme use case'leri. Akşam check-in'i bu cevaplarla önceden dolar.
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type AsyncResult } from '@core/result/Result';
import { todayOf, type Clock } from '@domain/ports/Clock';
import type { HabitCheck } from '@features/checkin/domain/entities';
import type { HabitEntryRepository } from '@features/checkin/domain/ports';
import { resolveCheckInDay } from '@features/checkin/domain/rules';
import {
  STATUSES_BY_KIND,
  type Habit,
  type HabitEntryStatus,
} from '@features/habits/domain/entities';

export interface DayHabitEntries {
  readonly date: string;
  readonly entries: readonly HabitCheck[];
}

// Verilen günün (varsayılan bugün) işaretlenmiş cevapları
export class GetHabitEntriesUseCase {
  constructor(
    private readonly repository: HabitEntryRepository,
    private readonly clock: Clock,
  ) {}

  async execute(date?: string): AsyncResult<DayHabitEntries> {
    const day = date ?? todayOf(this.clock);
    const result = await this.repository.listRange(day, day);
    if (!result.ok) return result;
    return ok({
      date: day,
      entries: result.value.map(({ habitId, status }) => ({ habitId, status })),
    });
  }
}

// Alışkanlığı işaretler; status verilmezse işareti geri alır
export class MarkHabitUseCase {
  constructor(
    private readonly repository: HabitEntryRepository,
    private readonly clock: Clock,
  ) {}

  async execute(
    date: string,
    habit: Habit,
    status: HabitEntryStatus | undefined,
  ): AsyncResult<void> {
    if (!resolveCheckInDay(date, todayOf(this.clock))) {
      return err(new ValidationFailure('Alışkanlık yalnızca bugün ve dün için işaretlenebilir.'));
    }
    if (!status) return this.repository.clear(date, habit.id);
    if (!STATUSES_BY_KIND[habit.kind].includes(status)) {
      return err(new ValidationFailure('Alışkanlık türü ile cevap uyumsuz.'));
    }
    return this.repository.mark(date, habit.id, status);
  }
}
