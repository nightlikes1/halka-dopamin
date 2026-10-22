// Görevin tamamlanma durumunu ayarlar
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type AsyncResult } from '@core/result/Result';
import type { TaskList } from '@domain/entities/Task';
import type { ITasksRepository } from '@domain/repositories/ITasksRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class ToggleTaskUseCase {
  constructor(private readonly repository: ITasksRepository) {}

  execute(taskId: string, done: boolean): AsyncResult<TaskList> {
    return updateEntity(this.repository, (list) => {
      if (!list.items.some((task) => task.id === taskId)) {
        return err(new ValidationFailure('Görev bulunamadı.'));
      }
      return ok({
        ...list,
        items: list.items.map((task) => (task.id === taskId ? { ...task, done } : task)),
      });
    });
  }
}
