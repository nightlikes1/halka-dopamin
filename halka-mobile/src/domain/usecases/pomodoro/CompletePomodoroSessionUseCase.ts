// Süresi dolan seansı tamamlar ve sonraki moda geçer
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type AsyncResult } from '@core/result/Result';
import { isPomodoroFinished, type Pomodoro } from '@domain/entities/Pomodoro';
import type { Clock, IEntityRepository } from '@domain/ports';
import { completePomodoroSession } from '@domain/services/pomodoroRules';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

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
