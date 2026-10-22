// Görev listesi repository sözleşmesi
import type { TaskList } from '@domain/entities/Task';
import type { IEntityRepository } from '@domain/repositories/IEntityRepository';

export type ITasksRepository = IEntityRepository<TaskList>;
