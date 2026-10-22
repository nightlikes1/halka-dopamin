// Görevi listeden siler
import { ok, type AsyncResult } from '@core/result/Result';
import type { TaskList } from '@domain/entities/Task';
import type { ITasksRepository } from '@domain/repositories/ITasksRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class DeleteTaskUseCase {
  constructor(private readonly repository: ITasksRepository) {}

  execute(taskId: string): AsyncResult<TaskList> {
    return updateEntity(this.repository, (list) =>
      ok({ ...list, items: list.items.filter((task) => task.id !== taskId) }),
    );
  }
}
