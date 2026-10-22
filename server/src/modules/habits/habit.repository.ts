// Alışkanlık veri erişimi: arayüz + Prisma implementasyonu
import type { PrismaClient } from '../../db/prisma.js';
import {
  habitTargetSchema,
  type CreateHabitInput,
  type HabitDto,
  type HabitKind,
} from './habits.schemas.js';

export interface HabitRepository {
  listActive(userId: string): Promise<HabitDto[]>;
  create(userId: string, input: CreateHabitInput): Promise<HabitDto>;
  // Bulunamazsa false döner
  archive(userId: string, habitId: string, at: Date): Promise<boolean>;
  // Check-in doğrulaması için: kullanıcıya ait (arşivlenmiş dahil) alışkanlıkların türleri
  findKinds(userId: string, habitIds: readonly string[]): Promise<Map<string, HabitKind>>;
}

interface HabitRow {
  id: string;
  kind: HabitKind;
  title: string;
  target: unknown;
  createdAt: Date;
}

const toDto = (row: HabitRow): HabitDto => {
  const target = habitTargetSchema.safeParse(row.target);
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    target: target.success ? target.data : { type: 'daily' },
    createdAt: row.createdAt.toISOString(),
  };
};

const habitSelect = { id: true, kind: true, title: true, target: true, createdAt: true } as const;

export class PrismaHabitRepository implements HabitRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listActive(userId: string): Promise<HabitDto[]> {
    const rows = await this.prisma.habit.findMany({
      where: { userId, archivedAt: null },
      orderBy: { createdAt: 'asc' },
      select: habitSelect,
    });
    return rows.map(toDto);
  }

  async create(userId: string, input: CreateHabitInput): Promise<HabitDto> {
    const row = await this.prisma.habit.create({
      data: { userId, kind: input.kind, title: input.title, target: input.target },
      select: habitSelect,
    });
    return toDto(row);
  }

  async archive(userId: string, habitId: string, at: Date): Promise<boolean> {
    const result = await this.prisma.habit.updateMany({
      where: { id: habitId, userId, archivedAt: null },
      data: { archivedAt: at },
    });
    return result.count > 0;
  }

  async findKinds(userId: string, habitIds: readonly string[]): Promise<Map<string, HabitKind>> {
    const rows = await this.prisma.habit.findMany({
      where: { userId, id: { in: [...habitIds] } },
      select: { id: true, kind: true },
    });
    return new Map(rows.map((row) => [row.id, row.kind]));
  }
}
