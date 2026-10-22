// Alışkanlık istek/yanıt şemaları
import { z } from 'zod';

export const HABIT_TITLE_MAX_LENGTH = 80;

export const habitKindSchema = z.enum(['quit', 'build']);
export type HabitKind = z.infer<typeof habitKindSchema>;

export const habitTargetSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('daily') }),
  z.object({ type: z.literal('weeklyCount'), count: z.number().int().min(1).max(7) }),
  z.object({
    type: z.literal('dailyAmount'),
    amount: z.number().positive().max(100_000),
    unit: z.string().trim().min(1).max(20),
  }),
]);
export type HabitTarget = z.infer<typeof habitTargetSchema>;

export const createHabitBodySchema = z.object({
  kind: habitKindSchema,
  title: z
    .string()
    .trim()
    .min(1, 'Alışkanlık adı boş olamaz.')
    .max(HABIT_TITLE_MAX_LENGTH, `En fazla ${HABIT_TITLE_MAX_LENGTH} karakter.`),
  target: habitTargetSchema.default({ type: 'daily' }),
});
export type CreateHabitInput = z.infer<typeof createHabitBodySchema>;

export const habitIdParamsSchema = z.object({ id: z.uuid('Geçersiz alışkanlık kimliği.') });

export interface HabitDto {
  readonly id: string;
  readonly kind: HabitKind;
  readonly title: string;
  readonly target: HabitTarget;
  readonly createdAt: string;
}
