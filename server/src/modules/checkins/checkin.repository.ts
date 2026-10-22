// Check-in veri erişimi: check-in satırı + o günün alışkanlık cevapları (habit_entries)
import { fromDbDate, toDbDate } from '../../core/dates.js';
import type { PrismaClient } from '../../db/prisma.js';
import type { CheckInDto, CheckInEntryDto, SaveCheckInInput } from './checkins.schemas.js';

export interface CheckInRepository {
  get(userId: string, date: string): Promise<CheckInDto | null>;
  listRange(userId: string, from: string, to: string): Promise<CheckInDto[]>;
  // Varsa günceller, yoksa oluşturur; o günün cevapları tamamen yenilenir
  save(userId: string, date: string, input: SaveCheckInInput): Promise<CheckInDto>;
}

interface CheckInRow {
  date: Date;
  rating: number;
  completedAt: Date;
  updatedAt: Date;
}

const toDto = (row: CheckInRow, entries: readonly CheckInEntryDto[]): CheckInDto => ({
  date: fromDbDate(row.date),
  rating: row.rating,
  completedAt: row.completedAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  entries,
});

export class PrismaCheckInRepository implements CheckInRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async get(userId: string, date: string): Promise<CheckInDto | null> {
    const [checkIn] = await this.listRange(userId, date, date);
    return checkIn ?? null;
  }

  async listRange(userId: string, from: string, to: string): Promise<CheckInDto[]> {
    const dateFilter = { gte: toDbDate(from), lte: toDbDate(to) };
    const [rows, entries] = await Promise.all([
      this.prisma.dailyCheckIn.findMany({
        where: { userId, date: dateFilter },
        orderBy: { date: 'asc' },
      }),
      this.prisma.habitEntry.findMany({
        where: { date: dateFilter, habit: { userId } },
        select: { habitId: true, date: true, status: true },
      }),
    ]);

    const entriesByDate = new Map<string, CheckInEntryDto[]>();
    for (const entry of entries) {
      const key = fromDbDate(entry.date);
      const list = entriesByDate.get(key) ?? [];
      list.push({ habitId: entry.habitId, status: entry.status });
      entriesByDate.set(key, list);
    }
    return rows.map((row) => toDto(row, entriesByDate.get(fromDbDate(row.date)) ?? []));
  }

  async save(userId: string, date: string, input: SaveCheckInInput): Promise<CheckInDto> {
    const dbDate = toDbDate(date);
    await this.prisma.$transaction(async (tx) => {
      await tx.dailyCheckIn.upsert({
        where: { userId_date: { userId, date: dbDate } },
        create: { userId, date: dbDate, rating: input.rating },
        update: { rating: input.rating },
      });
      await tx.habitEntry.deleteMany({ where: { date: dbDate, habit: { userId } } });
      if (input.entries.length > 0) {
        await tx.habitEntry.createMany({
          data: input.entries.map((entry) => ({
            habitId: entry.habitId,
            date: dbDate,
            status: entry.status,
          })),
        });
      }
    });
    const saved = await this.get(userId, date);
    if (!saved) throw new Error('Check-in kaydedildi ama okunamadı.');
    return saved;
  }
}
