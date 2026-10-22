// Check-in API istemcisi: DTO doğrulama + try/catch burada toplanır
import type { AxiosInstance } from 'axios';
import { z } from 'zod';
import { toFailure } from '@core/api/httpClient';
import { ServerFailure } from '@core/errors/Failure';
import { err, ok, type AsyncResult } from '@core/result/Result';
import {
  isDayRating,
  type CheckInInput,
  type DailyCheckIn,
} from '@features/checkin/domain/entities';
import type { CheckInRepository } from '@features/checkin/domain/ports';

const checkInDtoSchema = z.object({
  date: z.string(),
  rating: z.number().int().refine(isDayRating),
  completedAt: z.string(),
  updatedAt: z.string(),
  entries: z.array(
    z.object({ habitId: z.string(), status: z.enum(['done', 'missed', 'clean', 'slip']) }),
  ),
});

type CheckInDto = z.infer<typeof checkInDtoSchema>;

const toCheckIn = (dto: CheckInDto): DailyCheckIn | null =>
  isDayRating(dto.rating)
    ? {
        date: dto.date,
        rating: dto.rating,
        entries: dto.entries,
        completedAt: dto.completedAt,
        updatedAt: dto.updatedAt,
      }
    : null;

const INVALID_RESPONSE = 'Sunucudan beklenmeyen bir yanıt geldi.';

export class HttpCheckInRepository implements CheckInRepository {
  constructor(private readonly http: AxiosInstance) {}

  async get(date: string): AsyncResult<DailyCheckIn | null> {
    try {
      const response = await this.http.get<unknown>(`/checkins/${date}`);
      const parsed = z.object({ checkIn: checkInDtoSchema.nullable() }).safeParse(response.data);
      if (!parsed.success) return err(new ServerFailure(INVALID_RESPONSE));
      return ok(parsed.data.checkIn ? toCheckIn(parsed.data.checkIn) : null);
    } catch (error) {
      return err(toFailure(error));
    }
  }

  async listRange(from: string, to: string): AsyncResult<readonly DailyCheckIn[]> {
    try {
      const response = await this.http.get<unknown>('/checkins', { params: { from, to } });
      const parsed = z.object({ checkIns: z.array(checkInDtoSchema) }).safeParse(response.data);
      if (!parsed.success) return err(new ServerFailure(INVALID_RESPONSE));
      return ok(
        parsed.data.checkIns
          .map(toCheckIn)
          .filter((checkIn): checkIn is DailyCheckIn => checkIn !== null),
      );
    } catch (error) {
      return err(toFailure(error));
    }
  }

  async save(date: string, input: CheckInInput): AsyncResult<DailyCheckIn> {
    try {
      const response = await this.http.put<unknown>(`/checkins/${date}`, input);
      const parsed = z.object({ checkIn: checkInDtoSchema }).safeParse(response.data);
      const checkIn = parsed.success ? toCheckIn(parsed.data.checkIn) : null;
      return checkIn ? ok(checkIn) : err(new ServerFailure(INVALID_RESPONSE));
    } catch (error) {
      return err(toFailure(error));
    }
  }
}
