// Gün notu veri erişimi: arayüz + Prisma implementasyonu
import { fromDbDate, toDbDate } from '../../core/dates.js';
import type { PrismaClient } from '../../db/prisma.js';
import type { DayNoteDto } from './dayNotes.schemas.js';

export interface DayNoteRepository {
  listRange(userId: string, from: string, to: string): Promise<DayNoteDto[]>;
  upsert(userId: string, date: string, text: string): Promise<DayNoteDto>;
  // Bulunamazsa false döner
  delete(userId: string, date: string): Promise<boolean>;
}

interface DayNoteRow {
  date: Date;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const toDto = (row: DayNoteRow): DayNoteDto => ({
  date: fromDbDate(row.date),
  text: row.text,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export class PrismaDayNoteRepository implements DayNoteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listRange(userId: string, from: string, to: string): Promise<DayNoteDto[]> {
    const rows = await this.prisma.dayNote.findMany({
      where: { userId, date: { gte: toDbDate(from), lte: toDbDate(to) } },
      orderBy: { date: 'asc' },
    });
    return rows.map(toDto);
  }

  async upsert(userId: string, date: string, text: string): Promise<DayNoteDto> {
    const dbDate = toDbDate(date);
    const row = await this.prisma.dayNote.upsert({
      where: { userId_date: { userId, date: dbDate } },
      create: { userId, date: dbDate, text },
      update: { text },
    });
    return toDto(row);
  }

  async delete(userId: string, date: string): Promise<boolean> {
    const result = await this.prisma.dayNote.deleteMany({
      where: { userId, date: toDbDate(date) },
    });
    return result.count > 0;
  }
}
