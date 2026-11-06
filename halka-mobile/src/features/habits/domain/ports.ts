// Alışkanlık repository sözleşmesi (implementasyon: HTTP API)
import type { AsyncResult } from '@core/result/Result';
import type { CreateHabitInput, Habit, UpdateHabitInput } from '@features/habits/domain/entities';

export interface HabitRepository {
  listActive(): AsyncResult<readonly Habit[]>;
  create(input: CreateHabitInput): AsyncResult<Habit>;
  update(id: string, input: UpdateHabitInput): AsyncResult<Habit>;
  // Silme yerine arşivleme: geçmiş check-in cevapları korunur
  archive(id: string): AsyncResult<void>;
}
