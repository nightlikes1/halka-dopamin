# -------------------------------------------------------------
# Aşama 1: Bağımlılıklar, Prisma Üretimi ve TypeScript Derleme
# -------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Derleme ve Prisma için sistem kütüphaneleri
RUN apk add --no-cache openssl

# Bağımlılık bildirimlerini kopyala
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# Prisma istemcisini üretebilmek için derleme anında placeholder URL
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

# Temiz kurulum
RUN npm ci

# Kaynak kodları kopyala
COPY src ./src

# TypeScript derleme (tsconfig.build.json)
RUN npm run build

# Yalnızca üretim bağımlılıklarını tut
RUN npm prune --omit=dev

# -------------------------------------------------------------
# Aşama 2: Çalışma Ortamı (Production Runner)
# -------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Prisma engine için openssl
RUN apk add --no-cache openssl wget

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Güvenlik için non-root sistem kullanıcısı
RUN addgroup -S halka && adduser -S -G halka halka

# Sadece derlenmiş kod ve üretim bağımlılıklarını kopyala
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

USER halka

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1

CMD ["node", "dist/server.js"]
