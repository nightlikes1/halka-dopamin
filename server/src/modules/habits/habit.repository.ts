// Alışkanlık veri erişimi: arayüz + Prisma implementasyonu
import type { PrismaClient } from '../../db/prisma.js';
import {
  habitTargetSchema,
  type CreateHabitInput,
  type HabitDto,
  type HabitKind,
  type UpdateHabitInput,
} from './habits.schemas.js';

export interface HabitRepository {
  listActive(userId: string): Promise<HabitDto[]>;
  create(userId: string, input: CreateHabitInput): Promise<HabitDto>;
  // Bulunamazsa null döner. Tür değişirse geçmiş cevaplar da yeni türe çevrilir
  update(userId: string, habitId: string, input: UpdateHabitInput): Promise<HabitDto | null>;
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

// Yeni türe göre cevap çevirisi: "tamamlandı" ve "tamamlanmadı" anlamı korunur
const STATUS_CONVERSIONS = {
  build: [
    { from: 'clean', to: 'done' },
    { from: 'slip', to: 'missed' },
  ],
  quit: [
    { from: 'done', to: 'clean' },
    { from: 'missed', to: 'slip' },
  ],
} as const;

// Veritabanı uzakta: varsayılan süreler (2 ve 5 sn) birkaç sorguluk işlemde yetmeyebilir
const SLOW_TRANSACTION = { maxWait: 10_000, timeout: 15_000 };

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

  async update(userId: string, habitId: string, input: UpdateHabitInput): Promise<HabitDto | null> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.habit.findFirst({
        where: { id: habitId, userId, archivedAt: null },
        select: { kind: true },
      });
      if (!current) return null;
      if (current.kind !== input.kind) {
        for (const { from, to } of STATUS_CONVERSIONS[input.kind]) {
          await tx.habitEntry.updateMany({
            where: { habitId, status: from },
            data: { status: to },
          });
        }
      }
      const row = await tx.habit.update({
        where: { id: habitId },
        data: { kind: input.kind, title: input.title },
        select: habitSelect,
      });
      return toDto(row);
    }, SLOW_TRANSACTION);
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
