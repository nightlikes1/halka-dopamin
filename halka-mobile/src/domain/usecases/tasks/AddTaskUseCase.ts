// Listenin başına yeni görev ekler
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type AsyncResult } from '@core/result/Result';
import { createId } from '@core/utils/id';
import { TASK_TEXT_MAX_LENGTH, type TaskList, type TaskPriority } from '@domain/entities/Task';
import type { ITasksRepository } from '@domain/repositories/ITasksRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class AddTaskUseCase {
  constructor(private readonly repository: ITasksRepository) {}

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
