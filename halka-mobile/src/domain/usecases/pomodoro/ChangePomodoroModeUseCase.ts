// Odak / kısa mola / uzun mola modları arasında geçiş
import { ok, type AsyncResult } from '@core/result/Result';
import type { Pomodoro, PomodoroMode } from '@domain/entities/Pomodoro';
import type { IPomodoroRepository } from '@domain/repositories/IPomodoroRepository';
import { switchPomodoroMode } from '@domain/services/pomodoroRules';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class ChangePomodoroModeUseCase {
  constructor(private readonly repository: IPomodoroRepository) {}

  execute(mode: PomodoroMode): AsyncResult<Pomodoro> {
    return updateEntity(this.repository, (pomodoro) => ok(switchPomodoroMode(pomodoro, mode)));
  }
}
