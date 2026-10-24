# Halka + Boş Vakit & Dopamin Takip — Proje Kuralları

Bu dosya her oturumda bağlam olarak okunur. Kararlar değişirse burayı güncelle.

## Klasörler

| Klasör | Ne | Durum |
|---|---|---|
| `halka---Kopya-main/` | Orijinal Halka web uygulaması (Vite + vanilla JS) | Referans; **dokunma** |
| `halka-mobile/` | Expo SDK 57 + React Native 0.86 + TS strict mobil uygulama | Aktif |
| `server/` | Fastify 5 + Prisma 7 + Supabase PostgreSQL API | Aktif |

## Ürün kararları (kullanıcı onaylı)

- Dopamin takip uygulaması **Halka'nın içinde** alt sekmelerle: Bugün · Odak · Karakter · Halka · İstatistik
  (açılış sekmesi Bugün; Rehberler Faz 3'te Bugün/Karakter içinden açılacak).
- Veri: **kendi API'miz + Supabase PostgreSQL** (Prisma 7 driver adapter ile bağlanır; Supabase doğrudan istemciye açılmaz, istekler Fastify API üzerinden geçer). Telefon API'ye bağlanır.
- Giriş: e-posta + şifre, JWT (30 gün). Token mobilde `expo-secure-store`'da.
- Görsel (2026-10-19, **"Obsidyen ve Şampanya"** premium tema): zemin `#0B0B0D` → kart `#141416` → ikincil yüzey
  `#1F1E1B` (derinlik gölgeyle değil yüzey tonlarıyla), kenarlık `#2A2824`/`#3A3732` (≤ 1 px), metin krem `#EDE8DF` /
  `#8A857C`. **Şampanya altını `#C9A96E` yalnızca ödül anlarında** (seri, yakınlık halkası/etiketi, rozet, tamamlanma
  tiki, haftalık çubuk, seans tamamlandı) ve ana butonların çizgi stilinde. Sekme/link/seçili durum altın değil: krem
  metin ya da `goldMuted` zemin. Mücevher tonları (yakut, safir, zümrüt, ametist, kehribar) yalnızca dolgu/çubuk/nokta;
  yazı rengi olarak kullanılmaz (kontrast < 3). Gradient, gölge, ışıma yok.
  Dopamin: ucuz = yakut, kaliteli = zümrüt. Kaçırılan gün/bozulan seri kırmızı değil `textSecondary`.
- **Açık tema "Fildişi"** (2026-10-24): zemin `#DED8CE` → kart `#E8E3DA` → `#D3CCC0`, metin `#1D1B18`/`#5A544A`,
  altın koyulaştırılmış `#6B5021` (metin olarak ≥ 4,7:1), mücevher tonları aynı. Varsayılan koyu. Geçiş: Bugün üst
  barındaki güneş/ay butonu (`ThemeToggleButton`) ve Ayarlar → Tema. Seçim cihazda (`halka.themeMode`); renkler
  açılışta bir kez uygulanır (`applyThemeMode`, `colors`/`accentTints`/`dopamineColors` yerinde güncellenir), geçişte
  uygulama yeniden yüklenir (`reloadToApply`). Açık temada parçacıklar normal karışım + koyulaştırılmış palet
  (`PARTICLE_ON_LIGHT`). Eklenti vurgusu domain'de anlam (`reward | neutral`), renk `widgetAccentColor`.
- Görsel stil (2026-10-17): **"particles" varsayılan** (cam yüzeyler, parçacık
  karşılama/Bugün/Odak ekranları, yüzen cam sekme çubuğu) ve **"classic"** (opak kartlar); ikisi aynı paleti kullanır.
  Ayarlar → Görsel stil; seçim cihazda saklanır, uygulama yeniden yüklenince uygulanır.
- Karşılama (onboarding): yalnızca parçacık stilinde, ilk açılışta, giriş yapılmamışken; 3 sayfa.
- Fontlar (2026-10-19): sayfa/ekran başlıkları **Cormorant Garamond 500** (`fonts.serif`; varyantlar `greeting`,
  `headline`, `screenTitle`, `particleTitle`), geri kalan her şey **Inter** (rakamlar `tabular-nums`). Outfit/JetBrains kaldırıldı.
- Potansiyel Karakterim: XP/seviye modeli **iptal edildi**; yakınlık bağlı alışkanlıkların yapılma oranından hesaplanır (aşağıda).
  Yeniden tasarımdaki seviye halkası = yakınlık, "XP" çubuğu = bu hafta kayıtlı gün, rozetler mevcut veriden türetilir
  (`features/character/presentation/badges.ts`); "+XP" yazıları yerine "Tamamlandı".
- Karakter avatarı (2026-10-18): **Bitmoji tarzı çizgi karakter** (kendi SVG çizimimiz, paket yok) + arkasında **parçacık aura**.
  Parçalar: ten, yüz, saç + saç rengi, göz, kaş, ağız, sakal, gözlük, aksesuar, kıyafet + kıyafet rengi
  (`features/character/domain/look.ts`; renkler `avatarColors` sırası — sona ekle, araya ekleme; kıyafet mücevher tonları). Düzenlenmemişse kimlikten
  türetilir (`resolveLook`); "Rastgele" ve "Otomatik" var. **İfade yakınlığa bağlı** (`moodFor`: <30 dinleniyor, <55 sakin,
  <80 iyi gidiyor, ≥80 enerjik; kayıt yoksa sakin): ağız eğrisi, göz kapağı, kaş, yanak, salınım hızı.
  Aura biçimi (`orbit | flower | crystal`) ve paleti de otomatik + ince ayar. Düzenleme: kurulumun 4. adımı ve Karakter
  ekranındaki kalem → "Avatarım" (`AvatarEditor`). Sunucuda `avatar_look` (JSON), `avatar_shape`, `avatar_palette`.
- **DiceBear avatarları** (2026-10-21): 31 DiceBear stili uygulamaya gömülü (`@dicebear/core` + `@dicebear/collection` 9.4.2,
  internetsiz). Stil şeridinde "Halka" (kendi çizimimiz, yakınlığa bağlı ifade yalnız bunda) + 31 stil. Düzenleyici stilin
  şemasından üretilir (`presentation/dicebear/registry.ts`): seçenek listeleri → görsel kutucuklar (24'erli sayfa), `*Probability`
  → "Yok", renk listeleri → daireler (arka planda şeffaf + tema tonları); ofset/döndürme gizli. Seçilmeyen parçalar karakter
  tohumundan kararlı (`diceBearSeedFor`; "Baş harfler" kimlik cümlesini kullanır). Her stilde tasarımcı/lisans atfı gösterilir
  (CC BY 4.0 gereği). Sunucuda `avatar_dicebear` (JSON; stil listesi + güvenli anahtar/değer doğrulaması); null = Halka çizimi.
  Mobilde `SvgXml`, web'de `<img>` + veri adresi (RN-web Image SVG veri adresini yükleyemiyor).
- Canlılık/kullanılabilirlik (2026-10-18): parçacıklar dokunmaya/fareye tepki verir (itme + parlama, dokunuşta nabız);
  Bugün'deki alışkanlık satırı **sağa kaydırınca** işaretlenir (buton da çalışır, ek paket yok).
- Aynı adlı (büyük/küçük harf ve Türkçe karakter farkı gözetmeden) iki aktif alışkanlık olamaz: sunucu 409, istemci
  `sameHabitTitle` ile anında uyarır. Hitap adı tek kural: Halka'da değiştirilmiş ad > hesap adı (`resolveGreetingName`).
- Alışkanlıklar gün içinde Bugün ekranından tek dokunuşla işaretlenir (`/habit-entries`); akşam check-in bu
  cevaplarla önceden dolar. Denge ve yakınlık hesapları değişmedi (yalnızca check-in olan günler).
- Zaman tasarrufu referansı: toplam ucuz dopamin (zorunlu) + isteğe bağlı aktivite bazlı.
- Halka'nın mevcut widget verileri cihazda (AsyncStorage) kalır; yeni özellik verileri sunucuda.
- Çevrimdışı: tam senkron yok; çalışan sayaç ve bekleyen kayıtlar cihazda kuyruklanır (Faz 1).

## Çalışma kuralları

1. Her seferinde **tek faz**. Faz sonunda dur ve özetle: değişen dosyalar, eklenen paketler, test sonuçları, sonraki faz.
2. Faz bitmeden önce iki projede de çalıştır, hatasız olmalı:
   - `halka-mobile`: `npm run typecheck && npm run lint && npm test` + `npx expo export --platform android`
   - `server`: `npm run validate` (typecheck + lint + test + build)
3. Yeni paket eklemeden önce kullanıcıya gerekçesini söyle. Mobilde `npx expo install` kullan.
4. Emin olunmayan ürün kararlarında tahmin etme, **sor**.
5. Çalışan kodu bozma, ilgisiz dosyalara dokunma.
6. Kod isimleri İngilizce, yorumlar Türkçe ve kısa. `any` yok.
7. Kullanıcıyla Türkçe konuş.
8. İş/faz bitip 2. maddedeki doğrulama geçince sormadan commit et ve `origin main`'e (sterkk/halka-dopamin) push et.
   `server/.env`, kökteki `.mcp.json`/`package.json`/`package-lock.json` commit'e girmez; push öncesi secret taraması yap.

## Mobil mimari (`halka-mobile/src`)

```
core/          DI container (composition root), Failure/Result, api/ (axios + toFailure), i18n/tr.ts, theme/, utils/
domain/ data/ presentation/   ← Halka panosu (katman bazlı Clean Architecture)
features/<ad>/{domain,data,presentation}   ← yeni özellikler (özellik bazlı, içi katmanlı)
  auth/ activities/ focus/ onboarding/ character/ habits/ checkin/ history/ guides/ stats/ settings/
```

- Bağımlılık kuralı: `domain` (ve `features/*/domain`) React/RN/Expo/zod/`@data`/`@presentation` import edemez — ESLint zorlar.
- try/catch yalnızca data katmanında; üst katmanlar `Result<T>` görür. HTTP hataları `toFailure()` ile `network | auth | validation | server`.
- Ekranlar API'yi doğrudan çağırmaz: Screen → hook → UseCase.execute() → repository arayüzü → HTTP/AsyncStorage.
- Alias'lar: `@core @domain @data @presentation @features @assets` (tsconfig `paths` + babel `module-resolver`).
- Yeni özelliklerin tüm arayüz metinleri `core/i18n/tr.ts`'ten okunur.
- Renkler yalnızca `core/theme/tokens.ts` (`colors`, `dopamineColors`) üzerinden.
- İş mantığı (puan, yakınlık, seri, tasarruf, rehber eşleştirme) saf fonksiyonlarda + Jest testi.
  ESM paketleri (ör. `@dicebear`) Jest'te `transformIgnorePatterns` istisnasına eklenir (`jest.config.js`).
- API adresi: `EXPO_PUBLIC_API_URL` yoksa Expo `hostUri`'den bilgisayar IP'si + `:3000`.

## Sunucu mimarisi (`server/`)

```
prisma/schema.prisma        tüm tablolar (users, activities, activity_logs, running_timers, baselines,
                            characters, traits, habits, habit_traits, habit_entries, user_settings,
                            daily_checkins, day_notes)
prisma/migrations/          SQL migration'lar (init, checkins_day_notes, character_identity_traits, character_avatar, character_look, character_dicebear)
src/app.ts                  buildApp(deps) — bağımlılıklar dışarıdan (testte sahte repository)
src/modules/<ad>/           *.routes.ts · *.service.ts · *.repository.ts (arayüz + Prisma) · *.schemas.ts (zod)
src/plugins/                auth (JWT, app.authenticate), errorHandler (zod→400, AppError→kodu, diğer→500)
test/                       Vitest; DB gerektirmez (fastify.inject + bellek içi repository)
```

- Prisma 7: istemci `src/generated/prisma`'ya üretilir (git'e girmez), bağlantı `@prisma/adapter-pg` ile.
- Her sorgu `userId` ile filtrelenir; kullanıcı yalnızca kendi verisine erişir.
- Hata gövdesi her zaman `{ error: { code, message, issues? } }`, mesajlar Türkçe.
- `.env` git'e girmez (`DATABASE_URL`, `JWT_SECRET`); örnek: `.env.example`.
- Şema değişince: `npm run db:migrate` (Prisma 7'de `migrate dev` istemciyi üretmez; script `prisma generate`'i de çalıştırır).
- Günler `YYYY-MM-DD` (kullanıcının yerel günü) olarak istemciden gelir; `@db.Date` alanlarına UTC gece yarısı yazılır.
  Kesin "bugün/dün" kuralı istemcide; sunucu yalnızca saat dilimi farkını tolere eden geniş bir pencereyle korur.
- Uç noktalar: `/auth/*`, `/me`, `/habits` (GET/POST/DELETE=arşiv), `/checkins` (GET ?from&to, GET/PUT /:date),
  `/habit-entries` (GET ?from&to, PUT/DELETE /:date/:habitId — bugün/dün, check-in'den bağımsız),
  `/day-notes` (GET ?from&to, PUT/DELETE /:date), `/character` (GET/PUT/DELETE; PUT'ta `avatar`/`look`/`dicebear` yoksa mevcut korunur,
  `null` otomatiğe döner). Aralık en fazla 62 gün.
- Geliştirmede CORS açık (web önizleme için GET/POST/PUT/DELETE); üretimde kapalı.

## Akşam check-in ve gün notu (Faz 1A)

- Check-in: kullanıcı başına günde bir kayıt (`daily_checkins`, PK `user_id+date`); aynı gün tekrar → düzenleme.
  Yalnızca **bugün** ve **dün** için yapılabilir. Alışkanlık cevapları `habit_entries`'e yazılır:
  iyi alışkanlık `done | missed`, kötü alışkanlık `clean | slip`. Cevaplanmayan madde kaydedilmez ve skora girmez.
- **Günlük denge skoru** (`features/checkin/domain/balance.ts`):
  `100 × (0,4·iyiOranı + 0,4·kötüdenUzakOranı + 0,2·(puan−1)/4)`; cevapsız grubun ağırlığı diğerlerine dağılır.
  Not skoru etkilemez. Faz 1'de aktivite süreleri ek bileşen olacak.
- **Hatalı gün**: en az bir `missed`/`slip` ya da puan ≤ 2. Takvimde gri nokta (kırmızı değil); check-in'de not daveti açılır.
- Gün notu: her güne yazılabilir (gelecek gün hariç), en fazla 280 karakter, takvimden düzenlenir/silinir.

## Potansiyel Karakterim (Faz 2)

- Model: `Character { identity (≤60), createdAt }`, `Trait { name (≤30), order, habitIds[] }` (bağlar `habit_traits`'te).
  Kullanıcı başına bir karakter; 1–5 özellik; bir alışkanlık birden çok özelliğe bağlanabilir.
  Karakter silinince alışkanlıklar ve check-in geçmişi korunur. Arşivlenen alışkanlık bağları gösterilmez.
- **Yakınlık saklanmaz**; her seferinde check-in cevaplarından hesaplanır (`features/character/domain/proximity.ts`):
  - Özellik ilerlemesi (gün) = yapılan bağlı alışkanlık (`done`/`clean`) / o gün **cevaplanan** bağlı alışkanlık.
    Cevaplanan yoksa (check-in yok, bağ yok) özellik o güne katılmaz; %0 sayılmaz.
  - Günlük yakınlık = katılan özelliklerin ortalaması; check-in puanı `CHECKIN_WEIGHT` (0,2) ile katkı yapar:
    `((1 − 0,2) · ortalama + 0,2 · (puan − 1) / 4) × 100`. Puan tek başına yakınlık oluşturmaz.
  - Gösterilen yakınlık = son 7 gündeki kayıtlı günlerin ortalaması; özellik detayında 7/30 gün trendi.
- Dil suçlamasız ("Küçük adımlar birikir. Yarın yeni bir gün.").

## Tasarım kuralları (mobil arayüz)

Tema dosyaları `halka-mobile/src/core/theme/` (tek kaynak; `src/presentation/theme` yok):
`tokens.ts` (renk, boşluk, yarıçap, font), `typography.ts` (metin varyantları), `motion.ts` (eğri, süre, gecikme),
`elevation.ts` (gölge/parlama), `layout.ts` (kenar boşluğu, genişlik, dokunma alanı), `palettes.ts` (`withAlpha`,
Halka zincir paleti). Ekran ve bileşenlerde sabit değer yazılmaz; hep bu dosyalardan okunur.

- **Genel his:** koyu (varsayılan) ya da açık Fildişi, sade, premium. Modül düzeyinde renk okuyan kod tema uygulandıktan sonra yüklenir; sabit hex yazma. Sıcak obsidyen yüzeyler, krem metin; altın az görünür (yalnızca ödül).
- **Renk:** yalnızca `colors.*` (`obsidian` token'larından türetilir), `accentColors`/`accentTints`
  (`amber | sapphire | amethyst | ruby | emerald`; ikon kutusu = koyu mücevher zemini + **krem ikon**), `dopamineColors.*`.
  Hex/rgba yazma; saydamlık için `withAlpha`. Zemin `background` · kart `surface` · pill/input/bar `surfaceAlt` ·
  boş çubuk/halka `track` · güçlü kenarlık `border` · metin `textPrimary`/`textSecondary`/`textDisabled`.
  Ödül `gold` (`goldLight`, basılı `goldDark`, seçili zemin `goldMuted`). Hata metni `danger` (`#BB7F7A`, okunur);
  hata dolgu/nokta/kenarlığı `error` (`#A5524F`, metin olarak AA'yı geçmez). Butonlar çizgi stil (şeffaf zemin, 1 px
  kenar, renkli yazı); dolu altın yalnızca ödül anında. Çizgi karakter renkleri yalnızca `avatarColors`; ton için `mixHex`.
  Eski adlar (`bgPrimary`, `bgCard`, `textMain`…) yeni palete bağlıdır; yeni kodda spesifikasyon adlarını kullan.
- **Ölçüler:** ekran yan boşluğu 24 (`layout.screenPadding`), bölümler arası 24, liste arası 10 (`spacing.smd`).
  Köşe: büyük kart 28 (`radius.xl`), liste kartı 20 (`lg`), küçük kart 18 (`tile`), ikon kutusu 14 (`md`), pill `full`.
  `spacing.xs + 2` gibi aritmetik yok; ara değer gerekiyorsa ölçeğe ekle.
- **Tipografi:** metin her zaman `AppText` + `variant`. Selam `greeting` (28/700), bölüm `section` (18/600),
  kart `cardTitle` (16/600), alt metin `small`/`muted`, etiket `tag` (12), sayı `stat` (20, tabular), sayaç
  `timer` (64/700, tabular, −1 harf aralığı). Ekran başlığı `screenTitle` (serif). En küçük boyut 11; `fontWeight` yok.
- **İkonlar:** yalnızca `Icon` (Feather, çizgi stili). Feather'da olmayanlar `Icon`'daki `EXTRA_ICONS` ile
  (ör. `flame` → Ionicons). Emoji ikon olarak kullanılmaz; yalnızca içerik (ruh hali, puan yüzleri).
  Domain emojilerinin karşılıkları `presentation/components/common/iconMaps.ts`'te.
- **Dokunma / erişilebilirlik:** her dokunulabilir öğe ≥ 44 px (`layout.touchTarget`, küçükse `hitSlopFor`);
  seçim durumu `aria-checked` (radio/checkbox) / `aria-selected` (tab) ile verilir — `accessibilityState` web'de DOM'a
  yazılmaz. Arka plandaki sekmeler `TabScene` ile gizlenir (web'de `inert`; klavye odağı görünmeyen butona gitmez);
  iç içe dokunulabilir öğe yok; ikon butonlarında `accessibilityLabel` zorunlu; renk tek başına anlam taşımaz.
- **Animasyon** (`motion.ts`): eğri `easeOut` = bezier(0.2, 0.8, 0.2, 1). Basınca 0,92 (`ScalePressable`).
  Belirme için `Appear` (`up` 14 px / `pop` yaylı) kullan; Reanimated `entering` düzen animasyonunu yeni ekranlarda
  kullanma (web'de sonradan eklenen öğeyi akıştan çıkarıyor). Eski Halka bileşenlerinde `entering/exiting/layout`
  yalnızca `nativeOnly(...)` ile (web'de kapalı). Sürekli döngüler `useReducedMotion()` açıksa çalışmaz.
  Reanimated shared value'ları JSX/olay içinde `.set()`/`.get()` ile değiştir (React Compiler kuralı).
  Titreşim yalnızca `presentation/utils/haptics.ts` (`expo-haptics`, web'de sessiz).
- **Diyaloglar:** `Alert.alert` doğrudan kullanılmaz (react-native-web'de boş fonksiyon; web'de onaylar hiç açılmaz).
  Onay için `confirmAction`, bilgi için `showMessage` (`presentation/utils/dialogs.ts`): web'de tarayıcı
  `confirm`/`alert`, mobilde `Alert`.
- **Web'e özel CSS** (otomatik doldurma rengi, sayfa zemini) yalnızca `presentation/utils/webGlobalStyles.ts`'te.
  Platforma özel stil gerekiyorsa `Platform.OS` ile ayır (ör. iOS `filter: blur` desteklemez).

Ortak bileşenler (`presentation/components/common/`), yenisini yazmadan önce bunlar kullanılır:

| Bileşen | Ne zaman |
|---|---|
| `Screen` | Her ekranın iskeleti: güvenli alan + kaydırma + `contentMaxWidth`. Modal için `modal`, form için `keyboard` |
| `ScreenHeader` | Modal/alt ekran başlığı (`onClose` ile ✕, `bordered`). Sekme ekranları kendi üst barını kurar |
| `Card` / `SectionTitle` | Gruplanmış içerik ve kart başlığı |
| `ProgressRing` | Tek ya da iç içe halka (viewBox 200, 12 yönünden, yuvarlak uç, animasyonlu dolum ve renk geçişi) |
| `HabitCard` | Alışkanlık satırı: ikon kutusu · başlık + alt satır/çubuk · 44 px yuvarlak aksiyon (tik zıplaması + süzülen yazı) |
| `StatCard` | Küçük istatistik kartı (sayı + etiket) |
| `PillButton` | 56 px dolu renkli ana buton (`rounded` 18 / `pill`) |
| `IconButton` | İkon butonu: `surface` (üst bar, yuvarlak), `ring` (boş daire), `solid`, `outline`, `ghost` |
| `SegmentedControl` | Pill içinde seçici; seçili seçenek kendi renginde dolu |
| `Badge` | Rozet (renkli daire ikon + etiket; kilitli: kesikli kenarlık + kilit) |
| `SwipeToComplete` | Satırı sağa kaydırarak tamamla/geri al (PanResponder; yalnızca belirgin yatay sağa kaydırmayı yakalar) |
| `Appear`, `ScalePressable` | Belirme animasyonu, basınca küçülen dokunulabilir alan |
| `ActionButton`, `Chip`, `AppText`, `AppTextInput`, `ProgressBar`, `Icon` | Mevcut temel bileşenler (yeni stile uyarlandı) |

Değişiklikten sonra web önizlemesiyle (390×844) kontrol: `npx expo start --web` (CI=1 modunda dosya izleme
kapalıdır; değişiklik sonrası yeniden başlat).

## Parçacık tasarım dili

Kod `halka-mobile/src/presentation/particles/`:

```
engine/     saf TypeScript, React yok: palette.ts (64 adımlık LUT + nötr), vortexEngine, ringEngine, waveEngine,
            avatarEngine (240 referans, katmanlı yörünge/çiçek/kristal), interaction.ts (işaretçi tamponu, itme + nabız)
            çıktı: Float32Array, parçacık başına x, y (390×844 referans), boyut, alfa, renk sırası (types.ts)
renderer/   ParticleCanvas.tsx (iOS/Android: Skia Atlas + useFrameCallback, UI thread)
            ParticleCanvas.web.tsx (HTML canvas 2D + requestAnimationFrame; Skia/CanvasKit web'e yüklenmez)
            useParticlePointer (dokunma/fare → kanal; olayları yalnızca izler, kaydırmayı engellemez)
components/ ParticleVortex · ParticleRing (progress, burstKey) · ParticleWave (intensity, palette) · ParticleAvatar
            + BlinkDot, BottomFade, GlassCard
config.ts   zemin #0B0B0D, DPR ≤ 2, 50 fps eşiği, düşük güç oranı 0,6, parlaklık 0,75, sprite boyutu
```

- **Paletler:** `buzAtes` (varsayılan, şampanya), `ates` (kehribar), `buz` (safir), `mor` (ametist); adlar sunucuda
  saklandığı için değişmez, yalnızca renkler. Genel parlaklık `PARTICLE_INTENSITY` (0,75); bileşenlere `palette` prop'u. Odak modu: odak → buzAtes,
  kısa mola → buz, uzun mola → mor. Karşılama sayfaları: buzAtes → ates → mor.
- **Çizim:** toplamsal karışım (Skia `plus`, web `lighter`); tek beyaz yumuşak nokta dokusu × parçacık rengi (mobil
  Atlas `colors` + `modulate`) / renkli sprite sayfası (web `drawImage`). Boyut yarıçaptır; çap = boyut × `SPRITE_SPREAD`.
- **Performans:** karelerde nesne yaratma yok (Float32Array durum, önceden ayrılmış Skia tamponları). Hedef 60 fps.
  Yüksek tazeleme hızlı ekranlarda (90/120/144 Hz) fazla kareler atlanır (`renderer/pacing.ts`, en fazla ~60 fps);
  Android'de `filter: blur` kullanılmaz (orta segment telefonlarda pahalı; yalnızca web).
  İlk 90 karede gerçek süreyle kare hızı ölçülür; 50'nin altındaysa parçacıklar %60'a iner (dalgada yüzeye eşit
  seyreltme). Web'de ölçüm `globalThis.__halkaParticleFps` (ad ve adFraction); mobilde geliştirme modunda köşede fps.
  Ölçülen: masaüstü 144 fps; işlemci 6× yavaşlatılınca düşük güç modunda halka ~58, dalga ~64 fps.
- **Etkileşim:** `step(state, dt, inputs, activeFraction, pointer)`; motorlar `pointerField` ile itme/parlama alır.
  Kanal `[x, y, hedef güç, nabız x, nabız y, nabız sayacı]` (referans koordinatlar; `referenceWidth`, varsayılan 390).
  Tam ekran arka planlarda olay alıcısı ekran kökü (`targetRef` + `handlers`); halka ve avatar kendi kutusunu dinler.
  "Hareketi azalt" açıkken etkileşim kapalı.
- **Döngü durdurma:** ekran odakta değilse / uygulama arka planda / sekme gizliyse (`useLoopActive`) döngü durur.
  "Hareketi azalt" açıkken tek sabit kare (`settle`): halka doğrudan hedef ilerlemede, kıvılcım yok.
- **Worklet kuralları:** motor fonksiyonları `'worklet'` işaretli; Worklets eklentisi bunları sıralı tanımlamaya
  çevirir, bu yüzden bir worklet'in çağırdığı worklet dosyada **önce** tanımlanmalı (yoksa modül yüklenirken hata).
  Jest bu hatayı yakalamaz; web önizlemesiyle kontrol et. JS→UI için `scheduleOnUI`, UI→JS için `scheduleOnRN`
  (`react-native-worklets`); `runOnJS`/`runOnUI` kullanılmaz. Reanimated web'de `filter` dizi biçiminde verilir.
- **Tema:** `tokens.ts` koyu + açık palet içerir (`applyColorScheme`, `applyThemeMode`); `App.tsx` tercihleri okuyup paleti uygular, sonra
  `AppShell`'i tembel yükler (StyleSheet'ler renkleri modül yüklenirken okur). Cam yüzeyler: `colors.glass*`,
  vurgular `particleBlue`/`particlePink`. Parçacık stilinde sekme ekranları `useTabBarClearance` kadar alt boşluk bırakır.
- **Expo Go yeterli** (Skia 2.6.2 Expo Go'da var). Yerel iOS/Android derlemesinde Skia'nın kurulum betiği
  (`install-libs.js`) çalışmalı; npm "install-scripts" onayı gerekirse `npm install-scripts approve @shopify/react-native-skia`.
- Ekran görüntüsü: Playwright MCP'nin ekran görüntüsü aracı canvas animasyonu çalışırken siyah dönebilir; doğrudan
  `page.screenshot` kullan. Tarayıcı penceresi arka plandaysa Chrome rAF'ı 1 fps'e kısar (ölçümden önce öne al).

## Yol haritası

- [x] Faz 0: kurulum, siyah-gri tema, alt sekmeler, giriş/kayıt, API iskeleti, Prisma şeması + ilk migration
- [x] Faz 1A: alışkanlık yönetimi, akşam check-in, günlük denge skoru, gün notu + geçmiş takvimi
- [ ] Faz 1: aktivite takibi + günlük özet (açılış sekmesi "Bugün" olacak; aktivite süreleri denge skoruna eklenecek)
- [x] Faz 2: Potansiyel Karakterim (kimlik, özellikler, alışkanlık bağları, yakınlık)
- [ ] Faz 3: eğitim rehberleri (14 rehber, JSON içerik, Türkçe-dayanıklı eşleştirme)
- [ ] Faz 4: istatistikler ve içgörüler
- [ ] Faz 5: ek özellikler (kullanıcı seçecek)

## Çalıştırma

```bash
# 1) Sunucu (veritabanı ve tablolar kurulu; .env hazır)
cd server && npm run dev                                           # http://0.0.0.0:3000
# 2) Mobil
cd halka-mobile && npm start                                      # Expo Go ile QR
```
