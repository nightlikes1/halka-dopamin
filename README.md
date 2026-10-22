# Halka — Kişisel Hayat İşletim Sistemi + Dopamin Takibi

Halka panosunun React Native sürümü ve üzerine eklenen "Boş Vakit & Dopamin Takip" özellikleri.

| Klasör | İçerik |
|---|---|
| [`halka-mobile/`](halka-mobile) | Expo SDK 57 + React Native + TypeScript (strict) mobil uygulama, Clean Architecture |
| [`server/`](server) | Fastify + Prisma 7 + Supabase PostgreSQL API (giriş, alışkanlıklar, akşam check-in, gün notları) |
| [`halka---Kopya-main/`](halka---Kopya-main) | Orijinal Halka web uygulaması (Vite + JS) — referans |

Mimari, kurallar ve ürün kararları: [`CLAUDE.md`](CLAUDE.md)

## Çalıştırma

Gereken: Node.js 20+, Supabase hesabı (PostgreSQL), telefonda Expo Go (telefon ve bilgisayar aynı Wi-Fi'da).

```bash
# 1) Sunucu
cd server
npm install
cp .env.example .env        # Supabase DATABASE_URL ve JWT_SECRET'ı doldur
npx prisma migrate deploy   # Supabase üzerinde tabloları oluşturur
npm run dev                 # http://0.0.0.0:3000

# 2) Mobil (ayrı terminal)
cd halka-mobile
npm install
npm start                   # QR kodu Expo Go ile okut
```

## Kontroller

```bash
cd server && npm run validate        # tip kontrolü + lint + test + build
cd halka-mobile && npm run validate  # tip kontrolü + lint + test
```

## Docker ile Çalıştırma

Tüm yığını (Fastify API + Nginx Web) tek komutla Docker üzerinden ayağa kaldırmak için:

```bash
# Arka planda derle ve başlat
docker compose up -d --build

# Logları izle
docker compose logs -f

# Durdur
docker compose down
```

* **Web Paneli:** `http://localhost:8080`
* **API Sunucusu:** `http://localhost:3000` (`/health` kontrolü ile)

