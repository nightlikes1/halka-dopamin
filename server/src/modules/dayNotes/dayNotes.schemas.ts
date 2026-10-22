// Gün notu istek/yanıt şemaları
import { z } from 'zod';

export const DAY_NOTE_MAX_LENGTH = 280;

export const saveDayNoteBodySchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Not boş olamaz.')
    .max(DAY_NOTE_MAX_LENGTH, `Not en fazla ${DAY_NOTE_MAX_LENGTH} karakter olabilir.`),
});

export interface DayNoteDto {
  readonly date: string;
  readonly text: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
