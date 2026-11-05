// Görevi listeden siler
import { ok, type AsyncResult } from '@core/result/Result';
import type { TaskList } from '@domain/entities/Task';
import type { IEntityRepository } from '@domain/ports';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class DeleteTaskUseCase {
  constructor(private readonly repository: IEntityRepository<TaskList>) {}

  execute(taskId: string): AsyncResult<TaskList> {
    return updateEntity(this.repository, (list) =>
      ok({ ...list, items: list.items.filter((task) => task.id !== taskId) }),
    );
  }
}
