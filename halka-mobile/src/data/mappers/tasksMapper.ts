// Görev listesi DTO <-> Entity
import type { TasksDto } from '@data/dto/HalkaStorageDto';
import type { Mapper } from '@data/mappers/Mapper';
import type { TaskList, TaskPriority } from '@domain/entities/Task';

const toPriority = (value: string): TaskPriority => (value === 'high' ? 'high' : 'normal');

export const tasksMapper: Mapper<TasksDto, TaskList> = {
  toEntity: (dto) => ({
    items: dto.items.map((item) => ({
      id: item.id,
      text: item.text,
      done: item.done,
      priority: toPriority(item.priority),
    })),
  }),
  toDto: (entity) => ({
    items: entity.items.map((task) => ({
      id: task.id,
      text: task.text,
      done: task.done,
      priority: task.priority,
    })),
  }),
};
