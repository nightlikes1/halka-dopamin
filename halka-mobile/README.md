# ⛓️ Halka Mobile — Kişisel Hayat İşletim Sistemi

Halka web uygulamasının (Vite + Vanilla JS) **React Native + TypeScript (strict)** sürümü.
Expo SDK 57, Clean Architecture, Zustand, React Navigation, react-hook-form + zod.

## Kurulum ve çalıştırma

```bash
npm install
npm start            # Expo dev server (Expo Go ile QR okut)
npm run android      # Android emülatör / cihaz
npm run ios          # iOS simülatör (macOS)
```

Tüm kullanılan native modüller (expo-audio, svg, reanimated, slider, async-storage…) Expo Go'da
bulunur; ayrı development build gerekmez.

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm test` | Jest birim testleri (domain + data) |
| `npm run test:coverage` | Kapsam raporu |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint (Expo + Prettier + katman sınırı kuralları) |
| `npm run format` | Prettier |
| `npm run validate` | typecheck + lint + test |
| `npm run generate:sounds` | `assets/sounds/*.wav` dosyalarını yeniden üretir |

## Mimari

```
src/
  core/          DI container, Failure/Result, sabitler, yardımcılar, tema
  domain/        entity, repository arayüzleri, port'lar, saf kurallar, use case'ler (React/RN yok)
  data/          DTO (zod), mapper, AsyncStorage datasource, repository ve servis implementasyonları
  presentation/  ekranlar, bileşenler, navigation, hook (ViewModel), Zustand store
  __tests__/     Jest testleri ve fake'ler
```

Akış: `Screen → hook → UseCase.execute() → IRepository → SliceRepository → HalkaLocalDataSource → AsyncStorage`

- Bağımlılık kuralı ESLint ile zorlanır: `src/domain/**` React, RN, Expo, zod, `@data`, `@presentation` import edemez.
- Tüm try/catch `data` katmanındadır; üst katmanlar yalnızca `Result<T>` görür.
- Path alias'ları: `@core/*`, `@domain/*`, `@data/*`, `@presentation/*`, `@assets/*`
  (tsconfig `paths` + babel `module-resolver`).

## Sesler

Web sürümü sesleri Web Audio API ile çalışma anında sentezliyordu; React Native'de bu API yok.
`scripts/generate-sounds.mjs` aynı osilatör/zarf/filtre parametreleriyle WAV dosyalarını çevrimdışı
üretir ve `expo-audio` bunları çalar. Ortam sesleri 10 sn'lik kesintisiz döngülerdir.
