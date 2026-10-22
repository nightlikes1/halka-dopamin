// Mevcut modun süresini baştan kurar (durdurulmuş halde)
import { ok, type AsyncResult } from '@core/result/Result';
import type { Pomodoro } from '@domain/entities/Pomodoro';
import type { IPomodoroRepository } from '@domain/repositories/IPomodoroRepository';
import { resetPomodoro } from '@domain/services/pomodoroRules';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class ResetPomodoroUseCase {
  constructor(private readonly repository: IPomodoroRepository) {}

  execute(): AsyncResult<Pomodoro> {
    return updateEntity(this.repository, (pomodoro) => ok(resetPomodoro(pomodoro)));
  }
}
