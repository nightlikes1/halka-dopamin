// Pomodoro sayacını başlatır
import { ok, type AsyncResult } from '@core/result/Result';
import type { Pomodoro } from '@domain/entities/Pomodoro';
import type { Clock, IEntityRepository } from '@domain/ports';
import { startPomodoro } from '@domain/services/pomodoroRules';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

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
