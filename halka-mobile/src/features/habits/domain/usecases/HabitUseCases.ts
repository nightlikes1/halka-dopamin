// Alışkanlık use case'leri: listele, ekle, arşivle
import { ValidationFailure } from '@core/errors/Failure';
import { err, type AsyncResult } from '@core/result/Result';
import {
  HABIT_TITLE_MAX_LENGTH,
  type CreateHabitInput,
  type Habit,
} from '@features/habits/domain/entities';
import type { HabitRepository } from '@features/habits/domain/ports';

export class ListHabitsUseCase {
  constructor(private readonly repository: HabitRepository) {}

  execute(): AsyncResult<readonly Habit[]> {
    return this.repository.listActive();
  }
}

export class CreateHabitUseCase {
  constructor(private readonly repository: HabitRepository) {}

  async execute(input: CreateHabitInput): AsyncResult<Habit> {
    const title = input.title.trim();
    if (title.length === 0 || title.length > HABIT_TITLE_MAX_LENGTH) {
      return err(
        new ValidationFailure(`Alışkanlık adı 1-${HABIT_TITLE_MAX_LENGTH} karakter olmalı.`),
      );
    }
    return this.repository.create({ kind: input.kind, title });
  }
}

export class ArchiveHabitUseCase {
  constructor(private readonly repository: HabitRepository) {}

  execute(id: string): AsyncResult<void> {
    return this.repository.archive(id);
  }
}
