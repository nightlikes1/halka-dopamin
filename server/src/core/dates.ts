// Gün (YYYY-MM-DD) yardımcıları. Gün sınırı kullanıcının yerel saatine göredir;
// istemci yerel günü gönderir, sunucu yalnızca makul bir pencere içinde mi diye bakar.
import { z } from 'zod';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const isoDateSchema = z
  .string()
  .regex(ISO_DATE, 'Tarih YYYY-AA-GG biçiminde olmalı.')
  .refine((value) => toDbDate(value).toISOString().slice(0, 10) === value, 'Geçersiz tarih.');

// Prisma @db.Date alanları UTC gece yarısı olarak saklanır
export const toDbDate = (isoDate: string): Date => new Date(`${isoDate}T00:00:00.000Z`);

export const fromDbDate = (date: Date): string => date.toISOString().slice(0, 10);

export const addDays = (isoDate: string, days: number): string =>
  fromDbDate(new Date(toDbDate(isoDate).getTime() + days * MS_PER_DAY));

// Dünyadaki tüm saat dilimleri UTC ±14 saat içinde: kullanıcının "bugün"ü UTC gününe göre
// en fazla bir gün önde ya da geride olabilir
export function localTodayBounds(now: Date): {
  readonly earliest: string;
  readonly latest: string;
} {
  const utcToday = fromDbDate(now);
  return { earliest: addDays(utcToday, -1), latest: addDays(utcToday, 1) };
}

export const MAX_RANGE_DAYS = 62;

// ?from=YYYY-MM-DD&to=YYYY-MM-DD (en fazla ~2 ay)
export const dateRangeQuerySchema = z
  .object({ from: isoDateSchema, to: isoDateSchema })
  .refine(({ from, to }) => from <= to, 'Başlangıç bitişten sonra olamaz.')
  .refine(
    ({ from, to }) =>
      (toDbDate(to).getTime() - toDbDate(from).getTime()) / MS_PER_DAY <= MAX_RANGE_DAYS,
    `Aralık en fazla ${MAX_RANGE_DAYS} gün olabilir.`,
  );

export const dateParamsSchema = z.object({ date: isoDateSchema });

export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };
