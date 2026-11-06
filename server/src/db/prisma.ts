// Prisma istemcisi (Prisma 7: PostgreSQL bağlantısı driver adapter ile kurulur)
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

// Veritabanı uzakta: yeni bağlantı saniyeler sürer, sorgu ~350 ms. Bu yüzden bağlantılar boşta da açık
// kalır (varsayılan 10 sn'de kapanıyordu). Supabase oturum havuzu sınırlı olduğundan üst sınır düşük.
const POOL_OPTIONS = {
  min: 2,
  max: 5,
  idleTimeoutMillis: 5 * 60_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 30_000,
};

export function createPrismaClient(databaseUrl: string): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl, ...POOL_OPTIONS }),
  });
}

export type { PrismaClient };
// Json alanlarında SQL NULL (Prisma.DbNull) için
export { Prisma } from '../generated/prisma/client.js';
