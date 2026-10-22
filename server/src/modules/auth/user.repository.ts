// Kullanıcı veri erişimi: arayüz + Prisma implementasyonu
import { conflict } from '../../core/errors.js';
import type { PrismaClient } from '../../db/prisma.js';

export interface UserRecord {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly displayName: string | null;
}

export interface CreateUserInput {
  readonly email: string;
  readonly passwordHash: string;
  readonly displayName: string | null;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  // E-posta kullanılıyorsa conflict hatası fırlatır
  create(input: CreateUserInput): Promise<UserRecord>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}

const userSelect = { id: true, email: true, passwordHash: true, displayName: true } as const;

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { email }, select: userSelect });
  }

  findById(id: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { id }, select: userSelect });
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    try {
      // Kullanıcı ayarları satırı da birlikte oluşturulur
      return await this.prisma.user.create({
        data: { ...input, settings: { create: {} } },
        select: userSelect,
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw conflict('Bu e-posta adresi zaten kayıtlı.');
      throw error;
    }
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
