// Akşam check-in istek/yanıt şemaları
import { z } from 'zod';
import type { HabitKind } from '../habits/habits.schemas.js';

export const habitEntryStatusSchema = z.enum(['done', 'missed', 'clean', 'slip']);
export type HabitEntryStatus = z.infer<typeof habitEntryStatusSchema>;

// Her alışkanlık türünün alabileceği cevaplar
export const STATUSES_BY_KIND: Readonly<Record<HabitKind, readonly HabitEntryStatus[]>> = {
  build: ['done', 'missed'],
  quit: ['clean', 'slip'],
};

const entrySchema = z.object({
  habitId: z.uuid('Geçersiz alışkanlık kimliği.'),
  status: habitEntryStatusSchema,
});

export const saveCheckInBodySchema = z.object({
  rating: z.number().int().min(1, 'Puan 1-5 arasında olmalı.').max(5, 'Puan 1-5 arasında olmalı.'),
  entries: z
    .array(entrySchema)
    .max(100)
    .refine(
      (entries) => new Set(entries.map((entry) => entry.habitId)).size === entries.length,
      'Aynı alışkanlık iki kez cevaplanamaz.',
    ),
});
export type SaveCheckInInput = z.infer<typeof saveCheckInBodySchema>;

export interface CheckInEntryDto {
  readonly habitId: string;
  readonly status: HabitEntryStatus;
}

export interface CheckInDto {
  readonly date: string;
  readonly rating: number;
  readonly completedAt: string;
  readonly updatedAt: string;
  readonly entries: readonly CheckInEntryDto[];
}
