// Pomodoro sayacını başlatır
import { ok, type AsyncResult } from '@core/result/Result';
import type { Pomodoro } from '@domain/entities/Pomodoro';
import type { Clock } from '@domain/ports/Clock';
import type { IPomodoroRepository } from '@domain/repositories/IPomodoroRepository';
import { startPomodoro } from '@domain/services/pomodoroRules';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class StartPomodoroUseCase {
  constructor(
    private readonly repository: IPomodoroRepository,
    private readonly clock: Clock,
  ) {}

  execute(): AsyncResult<Pomodoro> {
    const nowMs = this.clock.now().getTime();
    return updateEntity(this.repository, (pomodoro) => ok(startPomodoro(pomodoro, nowMs)));
  }
}
