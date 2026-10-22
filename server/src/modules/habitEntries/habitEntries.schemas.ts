// Gün içinde tek tek alışkanlık işaretleme şemaları (check-in'den bağımsız)
import { z } from 'zod';
import { isoDateSchema } from '../../core/dates.js';
import { habitEntryStatusSchema, type CheckInEntryDto } from '../checkins/checkins.schemas.js';

export const habitEntryParamsSchema = z.object({
  date: isoDateSchema,
  habitId: z.uuid('Geçersiz alışkanlık kimliği.'),
});

export const saveHabitEntryBodySchema = z.object({ status: habitEntryStatusSchema });
export type SaveHabitEntryInput = z.infer<typeof saveHabitEntryBodySchema>;

export interface HabitEntryDto extends CheckInEntryDto {
  readonly date: string;
}
