// Gün notu API istemcisi: DTO doğrulama + try/catch burada toplanır
import type { AxiosInstance } from 'axios';
import { z } from 'zod';
import { toFailure } from '@core/api/httpClient';
import { ServerFailure } from '@core/errors/Failure';
import { err, ok, okVoid, type AsyncResult } from '@core/result/Result';
import type { DayNote } from '@features/history/domain/entities';
import type { DayNoteRepository } from '@features/history/domain/ports';

const dayNoteDtoSchema = z.object({
  date: z.string(),
  text: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const INVALID_RESPONSE = 'Sunucudan beklenmeyen bir yanıt geldi.';

export class HttpDayNoteRepository implements DayNoteRepository {
  constructor(private readonly http: AxiosInstance) {}

  async listRange(from: string, to: string): AsyncResult<readonly DayNote[]> {
    try {
      const response = await this.http.get<unknown>('/day-notes', { params: { from, to } });
      const parsed = z.object({ notes: z.array(dayNoteDtoSchema) }).safeParse(response.data);
      return parsed.success ? ok(parsed.data.notes) : err(new ServerFailure(INVALID_RESPONSE));
    } catch (error) {
      return err(toFailure(error));
    }
  }

  async save(date: string, text: string): AsyncResult<DayNote> {
    try {
      const response = await this.http.put<unknown>(`/day-notes/${date}`, { text });
      const parsed = z.object({ note: dayNoteDtoSchema }).safeParse(response.data);
      return parsed.success ? ok(parsed.data.note) : err(new ServerFailure(INVALID_RESPONSE));
    } catch (error) {
      return err(toFailure(error));
    }
  }

  async delete(date: string): AsyncResult<void> {
    try {
      await this.http.delete(`/day-notes/${date}`);
      return okVoid();
    } catch (error) {
      return err(toFailure(error));
    }
  }
}
