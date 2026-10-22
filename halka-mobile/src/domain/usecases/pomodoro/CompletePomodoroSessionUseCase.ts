// Süresi dolan seansı tamamlar ve sonraki moda geçer
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type AsyncResult } from '@core/result/Result';
import { isPomodoroFinished, type Pomodoro } from '@domain/entities/Pomodoro';
import type { Clock } from '@domain/ports/Clock';
import type { IPomodoroRepository } from '@domain/repositories/IPomodoroRepository';
import { completePomodoroSession } from '@domain/services/pomodoroRules';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class CompletePomodoroSessionUseCase {
  constructor(
    private readonly repository: IPomodoroRepository,
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
