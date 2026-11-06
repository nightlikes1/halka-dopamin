// Görev listesi
import { ValidationFailure } from '@core/errors/Failure';
import { type AsyncResult, err, ok } from '@core/result/Result';
import { createId } from '@core/utils/id';
import { TASK_TEXT_MAX_LENGTH, type TaskList, type TaskPriority } from '@domain/entities/Task';
import type { IEntityRepository } from '@domain/ports';
import { updateEntity } from '@domain/usecases/updateEntity';

// Listenin başına yeni görev ekler
export class AddTaskUseCase {
  constructor(private readonly repository: IEntityRepository<TaskList>) {}

  async execute(text: string, priority: TaskPriority = 'normal'): AsyncResult<TaskList> {
    const trimmed = text.trim();
    if (trimmed.length === 0 || trimmed.length > TASK_TEXT_MAX_LENGTH) {
      return err(new ValidationFailure('Görev metni geçersiz.'));
    }
    return updateEntity(this.repository, (list) =>
      ok({
        ...list,
        items: [{ id: createId('t'), text: trimmed, done: false, priority }, ...list.items],
      }),
    );
  }
}

// Görevi listeden siler
export class DeleteTaskUseCase {
  constructor(private readonly repository: IEntityRepository<TaskList>) {}

  execute(taskId: string): AsyncResult<TaskList> {
    return updateEntity(this.repository, (list) =>
      ok({ ...list, items: list.items.filter((task) => task.id !== taskId) }),
    );
  }
}

// Görevin tamamlanma durumunu ayarlar
export class ToggleTaskUseCase {
  constructor(private readonly repository: IEntityRepository<TaskList>) {}

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
