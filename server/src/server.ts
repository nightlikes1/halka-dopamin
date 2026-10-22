// Sunucu giriş noktası: yapılandırma -> veritabanı -> uygulama -> dinle
import { buildApp } from './app.js';
import { ConfigError, loadConfig } from './config/env.js';
import { createPrismaClient } from './db/prisma.js';
import { NodemailerEmailService } from './modules/auth/email.service.js';
import { BcryptPasswordHasher } from './modules/auth/passwordHasher.js';
import { PrismaPasswordResetTokenRepository } from './modules/auth/passwordResetToken.repository.js';
import { PrismaUserRepository } from './modules/auth/user.repository.js';
import { PrismaCharacterRepository } from './modules/character/character.repository.js';
import { PrismaCheckInRepository } from './modules/checkins/checkin.repository.js';
import { PrismaDayNoteRepository } from './modules/dayNotes/dayNote.repository.js';
import { PrismaHabitEntryRepository } from './modules/habitEntries/habitEntry.repository.js';
import { PrismaHabitRepository } from './modules/habits/habit.repository.js';

try {
  process.loadEnvFile();
} catch {
  // .env yoksa ortam değişkenleri kullanılır
}

async function main(): Promise<void> {
  const config = loadConfig();
  const prisma = createPrismaClient(config.databaseUrl);

  const app = await buildApp({
    config,
    userRepository: new PrismaUserRepository(prisma),
    passwordResetTokenRepository: new PrismaPasswordResetTokenRepository(prisma),
    emailService: new NodemailerEmailService(config),
    habitRepository: new PrismaHabitRepository(prisma),
    checkInRepository: new PrismaCheckInRepository(prisma),
    habitEntryRepository: new PrismaHabitEntryRepository(prisma),
    dayNoteRepository: new PrismaDayNoteRepository(prisma),
    characterRepository: new PrismaCharacterRepository(prisma),
    passwordHasher: new BcryptPasswordHasher(),
    checkDatabase: async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
      } catch {
        return false;
      }
    },
    logger: true,
  });

  // Ctrl+C ile düzgün kapanış
  const shutdown = async () => {
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());

  await app.listen({ host: config.host, port: config.port });
}

main().catch((error: unknown) => {
  const message = error instanceof ConfigError ? error.message : String(error);
  process.stderr.write(`\nSunucu başlatılamadı:\n${message}\n`);
  process.exit(1);
});
