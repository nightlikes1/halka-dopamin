// Alışkanlık API istemcisi: DTO doğrulama + try/catch burada toplanır
import type { AxiosInstance } from 'axios';
import { z } from 'zod';
import { toFailure } from '@core/api/httpClient';
import { ServerFailure } from '@core/errors/Failure';
import { err, ok, okVoid, type AsyncResult } from '@core/result/Result';
import type { CreateHabitInput, Habit } from '@features/habits/domain/entities';
import type { HabitRepository } from '@features/habits/domain/ports';

const targetDtoSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('daily') }),
  z.object({ type: z.literal('weeklyCount'), count: z.number() }),
  z.object({ type: z.literal('dailyAmount'), amount: z.number(), unit: z.string() }),
]);

const habitDtoSchema = z.object({
  id: z.string(),
  kind: z.enum(['quit', 'build']),
  title: z.string(),
  target: targetDtoSchema,
  createdAt: z.string(),
});

type HabitDto = z.infer<typeof habitDtoSchema>;

const toHabit = (dto: HabitDto): Habit => ({
  id: dto.id,
  kind: dto.kind,
  title: dto.title,
  target: dto.target,
  createdAt: dto.createdAt,
});

const INVALID_RESPONSE = 'Sunucudan beklenmeyen bir yanıt geldi.';

export class HttpHabitRepository implements HabitRepository {
  constructor(private readonly http: AxiosInstance) {}

  async listActive(): AsyncResult<readonly Habit[]> {
    try {
      const response = await this.http.get<unknown>('/habits');
      const parsed = z.object({ habits: z.array(habitDtoSchema) }).safeParse(response.data);
      return parsed.success
        ? ok(parsed.data.habits.map(toHabit))
        : err(new ServerFailure(INVALID_RESPONSE));
    } catch (error) {
      return err(toFailure(error));
    }
  }

  async create(input: CreateHabitInput): AsyncResult<Habit> {
    try {
      const response = await this.http.post<unknown>('/habits', input);
      const parsed = z.object({ habit: habitDtoSchema }).safeParse(response.data);
      return parsed.success
        ? ok(toHabit(parsed.data.habit))
        : err(new ServerFailure(INVALID_RESPONSE));
    } catch (error) {
      return err(toFailure(error));
    }
  }

  async archive(id: string): AsyncResult<void> {
    try {
      await this.http.delete(`/habits/${encodeURIComponent(id)}`);
      return okVoid();
    } catch (error) {
      return err(toFailure(error));
    }
  }
}
