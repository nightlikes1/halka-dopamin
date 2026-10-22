// Ham JSON'u DTO'ya çevirir; bozuk/eksik bölümler varsayılanla doldurulur
import type { z } from 'zod';
import { STORAGE_SCHEMA_VERSION } from '@core/constants/storage';
import {
  bigOneDtoSchema,
  budgetDtoSchema,
  layoutDtoSchema,
  moodDtoSchema,
  notesDtoSchema,
  pomodoroDtoSchema,
  profileDtoSchema,
  streakDtoSchema,
  tasksDtoSchema,
  waterDtoSchema,
  type HalkaStorageDto,
} from '@data/dto/HalkaStorageDto';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pick<T>(schema: z.ZodType<T>, value: unknown, fallback: T): T {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

export function parseStorageDto(raw: unknown, fallback: HalkaStorageDto): HalkaStorageDto {
  if (!isRecord(raw)) return fallback;
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    profile: pick(profileDtoSchema, raw.profile, fallback.profile),
    layout: pick(layoutDtoSchema, raw.layout, fallback.layout),
    water: pick(waterDtoSchema, raw.water, fallback.water),
    pomodoro: pick(pomodoroDtoSchema, raw.pomodoro, fallback.pomodoro),
    tasks: pick(tasksDtoSchema, raw.tasks, fallback.tasks),
    streak: pick(streakDtoSchema, raw.streak, fallback.streak),
    notes: pick(notesDtoSchema, raw.notes, fallback.notes),
    mood: pick(moodDtoSchema, raw.mood, fallback.mood),
    bigOne: pick(bigOneDtoSchema, raw.bigOne, fallback.bigOne),
    budget: pick(budgetDtoSchema, raw.budget, fallback.budget),
  };
}
