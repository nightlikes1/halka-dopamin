// Alışkanlık cevabı veri erişimi (habit_entries). Check-in ile aynı tabloyu paylaşır:
// akşam check-in'i kaydedilince o günün cevapları check-in içeriğiyle yenilenir.
import { fromDbDate, toDbDate } from '../../core/dates.js';
import type { PrismaClient } from '../../db/prisma.js';
import type { HabitEntryStatus } from '../checkins/checkins.schemas.js';
import type { HabitEntryDto } from './habitEntries.schemas.js';

export interface HabitEntryRepository {
  listRange(userId: string, from: string, to: string): Promise<HabitEntryDto[]>;
  // Alışkanlığın kullanıcıya ait olduğu servis tarafından doğrulanır
  upsert(habitId: string, date: string, status: HabitEntryStatus): Promise<HabitEntryDto>;
  // Silinecek kayıt yoksa false
  remove(userId: string, habitId: string, date: string): Promise<boolean>;
}

export class PrismaHabitEntryRepository implements HabitEntryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listRange(userId: string, from: string, to: string): Promise<HabitEntryDto[]> {
    const rows = await this.prisma.habitEntry.findMany({
      where: { date: { gte: toDbDate(from), lte: toDbDate(to) }, habit: { userId } },
      select: { habitId: true, date: true, status: true },
      orderBy: { date: 'asc' },
    });
    return rows.map((row) => ({
      habitId: row.habitId,
      date: fromDbDate(row.date),
      status: row.status,
    }));
  }

  async upsert(habitId: string, date: string, status: HabitEntryStatus): Promise<HabitEntryDto> {
    const dbDate = toDbDate(date);
    await this.prisma.habitEntry.upsert({
      where: { habitId_date: { habitId, date: dbDate } },
      create: { habitId, date: dbDate, status },
      update: { status },
    });
    return { habitId, date, status };
  }

  async remove(userId: string, habitId: string, date: string): Promise<boolean> {
    const result = await this.prisma.habitEntry.deleteMany({
      where: { habitId, date: toDbDate(date), habit: { userId } },
    });
    return result.count > 0;
  }
}
