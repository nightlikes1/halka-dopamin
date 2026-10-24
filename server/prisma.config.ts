// Prisma CLI yapılandırması (migrate, generate, studio)
import { defineConfig } from 'prisma/config';

// .env dosyasını Node'un yerleşik okuyucusuyla yükle (dotenv gerekmez)
try {
  process.loadEnvFile();
} catch {
  // .env yoksa ortam değişkenleri kullanılır
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  },
});
