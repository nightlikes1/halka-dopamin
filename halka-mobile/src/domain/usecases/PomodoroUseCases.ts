// Pomodoro sayacı
import { ValidationFailure } from '@core/errors/Failure';
import { type AsyncResult, err, ok } from '@core/result/Result';
import { isPomodoroFinished, type Pomodoro, type PomodoroMode } from '@domain/entities/Pomodoro';
import type { Clock, IEntityRepository } from '@domain/ports';
import {
  completePomodoroSession,
  pausePomodoro,
  resetPomodoro,
  startPomodoro,
  switchPomodoroMode,
} from '@domain/services/pomodoroRules';
import { updateEntity } from '@domain/usecases/updateEntity';

// Odak / kısa mola / uzun mola modları arasında geçiş
export class ChangePomodoroModeUseCase {
  constructor(private readonly repository: IEntityRepository<Pomodoro>) {}

  execute(mode: PomodoroMode): AsyncResult<Pomodoro> {
    return updateEntity(this.repository, (pomodoro) => ok(switchPomodoroMode(pomodoro, mode)));
  }
}

// Süresi dolan seansı tamamlar ve sonraki moda geçer
export class CompletePomodoroSessionUseCase {
  constructor(
    private readonly repository: IEntityRepository<Pomodoro>,
    private readonly clock: Clock,
  ) {}

  execute(): AsyncResult<Pomodoro> {
    const nowMs = this.clock.now().getTime();
    return updateEntity(this.repository, (pomodoro) =>
      isPomodoroFinished(pomodoro, nowMs)
        ? ok(completePomodoroSession(pomodoro))
        : err(new ValidationFailure('Seans henüz bitmedi.')),
    );
  }
}

// Pomodoro sayacını duraklatır (kalan süre saklanır)
export class PausePomodoroUseCase {
  constructor(
    private readonly repository: IEntityRepository<Pomodoro>,
    private readonly clock: Clock,
  ) {}

  execute(): AsyncResult<Pomodoro> {
    const nowMs = this.clock.now().getTime();
    return updateEntity(this.repository, (pomodoro) => ok(pausePomodoro(pomodoro, nowMs)));
  }
}

// Mevcut modun süresini baştan kurar (durdurulmuş halde)
export class ResetPomodoroUseCase {
  constructor(private readonly repository: IEntityRepository<Pomodoro>) {}

  execute(): AsyncResult<Pomodoro> {
    return updateEntity(this.repository, (pomodoro) => ok(resetPomodoro(pomodoro)));
  }
}

// Pomodoro sayacını başlatır
export class StartPomodoroUseCase {
  constructor(
    private readonly repository: IEntityRepository<Pomodoro>,
    private readonly clock: Clock,
  ) {}

  execute(): AsyncResult<Pomodoro> {
    const nowMs = this.clock.now().getTime();
    return updateEntity(this.repository, (pomodoro) => ok(startPomodoro(pomodoro, nowMs)));
  }
}
