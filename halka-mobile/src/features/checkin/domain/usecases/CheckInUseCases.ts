// Check-in use case'leri
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type AsyncResult } from '@core/result/Result';
import { addDays } from '@core/utils/date';
import { todayOf, type Clock } from '@domain/ports/Clock';
import {
  computeDailyBalance,
  isTroubledDay,
  type DailyBalance,
} from '@features/checkin/domain/balance';
import type { CheckInInput, DailyCheckIn } from '@features/checkin/domain/entities';
import type { CheckInRepository } from '@features/checkin/domain/ports';
import {
  resolveCheckInDay,
  validateCheckInInput,
  type CheckInDay,
} from '@features/checkin/domain/rules';
import type { Habit } from '@features/habits/domain/entities';

export interface CheckInOverview {
  readonly today: string;
  readonly todayCheckIn: DailyCheckIn | null;
  readonly yesterdayCheckIn: DailyCheckIn | null;
}

// Bugün sekmesi için bugünün ve dünün durumunu getirir
export class GetCheckInOverviewUseCase {
  constructor(
    private readonly repository: CheckInRepository,
    private readonly clock: Clock,
  ) {}

  async execute(): AsyncResult<CheckInOverview> {
    const today = todayOf(this.clock);
    const yesterday = addDays(today, -1);
    const result = await this.repository.listRange(yesterday, today);
    if (!result.ok) return result;
    return ok({
      today,
      todayCheckIn: result.value.find((checkIn) => checkIn.date === today) ?? null,
      yesterdayCheckIn: result.value.find((checkIn) => checkIn.date === yesterday) ?? null,
    });
  }
}

export interface CheckInSession {
  readonly date: string;
  readonly day: CheckInDay;
  // Kayıt varsa düzenleme modu
  readonly existing: DailyCheckIn | null;
}

// Check-in ekranını açar: gün penceresini doğrular, varsa mevcut kaydı getirir
export class OpenCheckInUseCase {
  constructor(
    private readonly repository: CheckInRepository,
    private readonly clock: Clock,
  ) {}

  async execute(date: string): AsyncResult<CheckInSession> {
    const day = resolveCheckInDay(date, todayOf(this.clock));
    if (!day) {
      return err(new ValidationFailure('Check-in yalnızca bugün ve dün için yapılabilir.'));
    }
    const existing = await this.repository.get(date);
    if (!existing.ok) return existing;
    return ok({ date, day, existing: existing.value });
  }
}

export interface SavedCheckIn {
  readonly checkIn: DailyCheckIn;
  readonly balance: DailyBalance;
  readonly troubled: boolean;
}

export class SaveCheckInUseCase {
  constructor(
    private readonly repository: CheckInRepository,
    private readonly clock: Clock,
  ) {}

  async execute(
    date: string,
    input: CheckInInput,
    habits: readonly Habit[],
  ): AsyncResult<SavedCheckIn> {
    if (!resolveCheckInDay(date, todayOf(this.clock))) {
      return err(new ValidationFailure('Check-in yalnızca bugün ve dün için yapılabilir.'));
    }
    const valid = validateCheckInInput(input, habits);
    if (!valid.ok) return valid;

    const saved = await this.repository.save(date, input);
    if (!saved.ok) return saved;
    return ok({
      checkIn: saved.value,
      balance: computeDailyBalance(saved.value),
      troubled: isTroubledDay(saved.value),
    });
  }
}
