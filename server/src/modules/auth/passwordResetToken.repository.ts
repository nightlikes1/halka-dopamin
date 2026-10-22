// Şifre sıfırlama belirteçleri veri erişimi: arayüz + Prisma implementasyonu
import type { PrismaClient } from '../../db/prisma.js';

export interface PasswordResetTokenRecord {
  readonly id: string;
  readonly userId: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly usedAt: Date | null;
  readonly createdAt: Date;
}

export interface PasswordResetTokenRepository {
  create(userId: string, tokenHash: string, expiresAt: Date): Promise<PasswordResetTokenRecord>;
  findValidToken(tokenHash: string, now: Date): Promise<PasswordResetTokenRecord | null>;
  markAsUsed(id: string, usedAt: Date): Promise<void>;
  invalidateAllForUser(userId: string): Promise<void>;
}

export class PrismaPasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<PasswordResetTokenRecord> {
    return this.prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findValidToken(tokenHash: string, now: Date): Promise<PasswordResetTokenRecord | null> {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: now },
      },
    });
  }

  async markAsUsed(id: string, usedAt: Date): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt },
    });
  }

  async invalidateAllForUser(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });
  }
}
