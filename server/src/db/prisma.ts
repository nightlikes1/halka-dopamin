// Prisma istemcisi (Prisma 7: PostgreSQL bağlantısı driver adapter ile kurulur)
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

export function createPrismaClient(databaseUrl: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
}

export type { PrismaClient };
// Json alanlarında SQL NULL (Prisma.DbNull) için
export { Prisma } from '../generated/prisma/client.js';
