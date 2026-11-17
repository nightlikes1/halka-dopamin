// Bugün ekranı use case'leri: alışkanlık geçmişi (seri için), cihazdaki dürtü / mini hal / not
// kayıtları ve Çember.
import { ValidationFailure } from '@core/errors/Failure';
import { err, type AsyncResult } from '@core/result/Result';
import { type Clock, todayOf } from '@core/utils/clock';
import { addDays } from '@core/utils/date';
import type { DatedHabitCheck } from '@features/checkin/domain/entities';
import type { HabitEntryRepository } from '@features/checkin/domain/ports';
import {
  SELF_NOTE_MAX_LENGTH,
  type Circle,
  type TodayLocalState,
  type UrgeKind,
  type UrgeOutcome,
} from '@features/today/domain/entities';
import { HISTORY_DAYS } from '@features/today/domain/dayRules';
import type { CircleRepository, TodayLocalRepository } from '@features/today/domain/ports';

// Son 62 günün alışkanlık cevapları (bugün dahil)
export class GetEntryHistoryUseCase {
  constructor(
    private readonly repository: HabitEntryRepository,
    private readonly clock: Clock,
  ) {}

  execute(): AsyncResult<readonly DatedHabitCheck[]> {
    const today = todayOf(this.clock);
    return this.repository.listRange(addDays(today, -(HISTORY_DAYS - 1)), today);
  }
}

export class GetTodayLocalUseCase {
  constructor(private readonly repository: TodayLocalRepository) {}

  execute(): AsyncResult<TodayLocalState> {
    return this.repository.read();
  }
}

export class LogUrgeUseCase {
  constructor(
    private readonly repository: TodayLocalRepository,
    private readonly clock: Clock,
    private readonly createId: () => string,
  ) {}

  execute(kind: UrgeKind, outcome: UrgeOutcome): AsyncResult<void> {
    const now = this.clock.now();
    return this.repository.addUrge({
      id: this.createId(),
      kind,
      outcome,
      date: todayOf(this.clock),
      at: now.toISOString(),
    });
  }
}

// Mini hal yalnızca bugün için işaretlenir
export class SetMiniUseCase {
  constructor(
    private readonly repository: TodayLocalRepository,
    private readonly clock: Clock,
  ) {}

  execute(habitId: string, on: boolean): AsyncResult<void> {
    return this.repository.setMini(todayOf(this.clock), habitId, on);
  }
}

export class SaveSelfNoteUseCase {
  constructor(private readonly repository: TodayLocalRepository) {}

  async execute(text: string): AsyncResult<void> {
    const trimmed = text.trim();
    if (trimmed.length > SELF_NOTE_MAX_LENGTH) {
      return err(new ValidationFailure(`Not en fazla ${SELF_NOTE_MAX_LENGTH} karakter olabilir.`));
    }
    return this.repository.setSelfNote(trimmed.length > 0 ? trimmed : null);
  }
}

export class MarkCelebratedUseCase {
  constructor(
    private readonly repository: TodayLocalRepository,
    private readonly clock: Clock,
  ) {}

  execute(): AsyncResult<void> {
    return this.repository.markCelebrated(todayOf(this.clock));
  }
}

export class GetCircleUseCase {
  constructor(private readonly repository: CircleRepository) {}

  execute(): AsyncResult<Circle | null> {
    return this.repository.get();
  }
}
