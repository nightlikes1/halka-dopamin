// /habit-entries API istemcisi: DTO doğrulama + try/catch burada toplanır
import type { AxiosInstance } from 'axios';
import { z } from 'zod';
import { toFailure } from '@core/api/httpClient';
import { ServerFailure } from '@core/errors/Failure';
import { err, ok, okVoid, type AsyncResult } from '@core/result/Result';
import type { DatedHabitCheck } from '@features/checkin/domain/entities';
import type { HabitEntryRepository } from '@features/checkin/domain/ports';
import type { HabitEntryStatus } from '@features/habits/domain/entities';

const entriesSchema = z.object({
  entries: z.array(
    z.object({
      habitId: z.string(),
      date: z.string(),
      status: z.enum(['done', 'missed', 'clean', 'slip']),
    }),
  ),
});

export class HttpHabitEntryRepository implements HabitEntryRepository {
  constructor(private readonly http: AxiosInstance) {}

  async listRange(from: string, to: string): AsyncResult<readonly DatedHabitCheck[]> {
    try {
      const response = await this.http.get<unknown>('/habit-entries', { params: { from, to } });
      const parsed = entriesSchema.safeParse(response.data);
      if (!parsed.success) return err(new ServerFailure('Sunucudan beklenmeyen bir yanıt geldi.'));
      return ok(parsed.data.entries);
    } catch (error) {
      return err(toFailure(error));
    }
  }

  async mark(date: string, habitId: string, status: HabitEntryStatus): AsyncResult<void> {
    try {
      await this.http.put(`/habit-entries/${date}/${habitId}`, { status });
      return okVoid();
    } catch (error) {
      return err(toFailure(error));
    }
  }

  async clear(date: string, habitId: string): AsyncResult<void> {
    try {
      await this.http.delete(`/habit-entries/${date}/${habitId}`);
      return okVoid();
    } catch (error) {
      return err(toFailure(error));
    }
  }
}
