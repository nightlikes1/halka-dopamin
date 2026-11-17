# Yeni tasarıma geçiş — TODO

Kaynak: 2026-11-17 tasarım PDF'leri (teslim notları + siyah tema ekranları). Kurallar `CLAUDE.md` → "Tasarım kuralları".
Her madde bitince `[x]` yap; bir bölüm bitince doğrulama (typecheck, lint, test, Android export, sunucu validate) + commit + push.

İşaretler: **(S)** = sunucu/Prisma şeması değişikliği gerekir, **(K)** = önce kullanıcıya sorulacak ürün kararı var.

## Bitenler

- [x] Tek tema (Halka), Sistem/Koyu/Aydınlık modu, yeni yazı ölçeği ve ölçüler
- [x] 4 sekme: Bugün · Odak · Araçlar · Gelişim
- [x] Bugün ekranı (canlı halka, seri, Çember şeridi, liste, ⋯ menü, geri al, akşam kartı)
- [x] Canım çekiyor — kısa akış (tür → sonuç)
- [x] Araçlar (eşit kartlar), Sakin saat, eklenti geniş görünümü
- [x] Gelişim, Haftalık bakış, Ay aynası (Faz 4)

## 1. Odak sekmesi

- [ ] Üst kısım: "Bugün N seans · M dk" + "Odak" başlığı + avatar
- [ ] Kart: mavi → çivit gradyan halka sayaç ("17:35 / Odaklanma zamanı"), seans noktaları
- [ ] "Görev: … ›" satırı → görev seçme penceresi (Halka görevlerinden)
- [ ] Çivit yuvarlak duraklat/başlat butonu, "Seansı bitir"
- [ ] Seans sonu penceresi (kısa mola / uzun mola / devam)
- [ ] Boş durum: "Henüz odak seansı yok / İlk seansı başlat"
- [ ] Eski `FocusScreen` / `ParticleFocusScreen` ikiliğini tek ekrana indir (parçacık efekti Liquid Glass stilinde kalabilir) **(K)**

## 2. Karakter

- [ ] Karakter ekranı: "‹ Gelişim", kalem + avatar; mor halkalı büyük avatar (halka = yakınlık)
- [ ] Kimlik + "En güçlü yanın …" cümlesi (en yüksek özellik)
- [ ] "N gündür yoldasın" (karakter oluşturma tarihinden) + "puan toplanmaz; yalnızca birlikte geçirdiğin günler sayılır"
- [ ] "En güçlü yanların": özellik başına mor çubuk + yüzde → dokununca Özellik detayı
- [ ] Rozetler yeni stile (`badges.ts` mevcut)
- [ ] Özellik detayı (`TraitDetailScreen`) yeni düzene: 7/30 gün trendi, bağlı alışkanlıklar
- [ ] Karakter kurulumu (`CharacterSetupScreen`) adımları yeni düzene (Panel, CapsuleButton, yeni başlıklar)
- [ ] Avatar düzenleyici yeni yüzeylere (işlev değişmez)
- [ ] "365. günde yeni halka rengi" gibi gün eşikleri **(K)**

## 3. Günlük akış ekranları

- [ ] Akşam kapanışı (`EveningCheckInScreen`): yeni düzen; ruh hali, alışkanlık cevapları, not daveti
- [ ] Akşam kapanışına "yarın için niyet" alanı **(S)(K)**
- [ ] Alışkanlıklarım (`HabitsScreen`): "Kazanmak istediklerim / Bırakmak istediklerim" grupları, "+ Yeni alışkanlık", Düzenle modu
- [ ] Alışkanlık sıralama (sürükle ya da yukarı/aşağı) **(S)**
- [ ] Arşiv ekranı: "Ara verdiğin alışkanlıklar burada bekler", "N gün sürdü · Ay'da ara verildi", "Geri getir", kalıcı sil **(S)**
- [ ] Geçmiş (`HistoryScreen`): takvim ve gün notu yeni düzene

## 4. Profil ve Ayarlar

- [ ] Profil üst kısmı: avatar + ad + e-posta + "N. gün · Kimlik ›" mor kapsül (→ Karakter)
- [ ] 3 istatistik kartı: en uzun seri (turuncu), toplam odak (çivit), yenilen dürtü (yeşil)
- [ ] HESAP: Ad ve fotoğraf, E-posta, Şifre — gri ikon kutulu satırlar
- [ ] TERCİHLER / Görünüm: TEMA (Sistem ✓ / Koyu / Aydınlık), HAREKET (Animasyonları azalt), Görsel stil
- [ ] Veri bölümü (çıkış, hesabı sil vb. mevcut işlevler yeni stile)

## 5. Giriş ve karşılama

- [ ] Giriş: gradyan halkalı logo, "halka", "Küçük adımlar, dengeli dopamin."; "Tekrar hoş geldin" kartı, ikonlu alanlar, gradyan "Giriş yap", koyu "Kayıt ol"
- [ ] Kayıt: "Hesap oluştur / Ücretsiz. Verilerin yalnızca senin.", "En az 8 karakter" işareti, koşullar notu
- [ ] "Apple ile devam et" **(S)(K)** — yeni paket ve sunucu tarafı ister
- [ ] Şifremi unuttum / sıfırla: yeni düzen, gönderildi durumu, 45 sn sonra tekrar gönder
- [ ] Karşılama (kayıt sonrası): 3 ilerleme çubuğu + "Atla"; "Neyi değiştirmek istiyorsun? En fazla iki tane seç" (6 kart) → öneri alışkanlıklar **(K)**
- [ ] İlk gün ekranı: 0/N halka, "İlk günün / Hoş geldin, Ad", ipucu kartı (uzun bas → mini hal)
- [ ] Bildirim izni adımı (6. bölümle birlikte)

## 6. Tasarımdaki yeni özellikler

- [ ] Canım çekiyor — tam 90 sn akış: ilk 10 sn basılı tut, nefes 4/4, 35–50. sn tepe (halka titrer), sonuç, kişisel alternatifler (dürtü türü başına ≤3)
- [ ] Canım çekiyor istatistikleri: "bu hafta yenilen dürtü", "%N dalgayı geçirme oranı"
- [ ] Kutlamalar: 7 / 30 / 100 gün seri varyantları (şu an yalnız "Gün tamam")
- [ ] Haftalık bakış kartı Pazar ve Pazartesi Bugün'de görünsün
- [ ] Ay aynası ayın ilk açılışında bir kez kendiliğinden açılsın
- [ ] Haftalık bakış: "Gelecek haftanın tek odağı" seçimi **(K)**
- [ ] Paylaş düğmesi (Gelişim, Ay aynası) **(K)**
- [ ] Ay aynası "~N saat kaydırmaya denk" — zaman tahmini şimdilik kapalı **(K)**
- [ ] Gelişmiş alışkanlık penceresi: ikon, sıklık (her gün / hafta içi / haftada 3), "şundan sonra yap", hatırlatma saati, mini hal tanımı **(S)**
- [ ] Bildirimler: sabah niyeti, önden uyarı, seriyi koru, akşam kapanışı; günde ≤2, 22:30–07:30 sessiz (yeni paket: `expo-notifications`) **(K)**
- [ ] Araçlar: Kutu nefesi (4·4·4·4), Odak sesleri, Hızlı not — mevcut eklentilerle eşleştir **(K)**
- [ ] Çember gerçek veriyle: kur / davet koduyla katıl (48 sa, tek kullanım), gün durumu, "Yanındayım", ortak hedef, gizlilik **(S)(K)**

## 7. Durumlar ve son kontrol

- [ ] Boş durumlar: Bugün ("Halkan seni bekliyor / İlk alışkanlığını ekle / Bana öneri ver"), Odak, Gelişim, Arşiv
- [ ] Yükleniyor ve çevrimdışı ekranları
- [ ] Kullanılmayan eski bileşenleri temizle (`Card`, `PillButton`, `ActionButton`, eski metin varyantları: `greeting`, `screenTitle`, `section`, `cardTitle`…)
- [ ] `CLAUDE.md` tasarım kurallarını yeni bileşenlere göre sadeleştir
- [ ] Tüm ekranlar web önizlemesinde (390×844) koyu + aydınlık modda gözden geçir
- [ ] Erişilebilirlik turu: dokunma alanı ≥44, etiketler, "Hareketi azalt"

## Önerilen sıra

1 → 2 → 3 (sunucu değişikliği olmayan maddeler) → 4 → 5 → 6 → 7.
**(S)** ve **(K)** maddeleri bölümünün sonuna bırakılır; başlamadan önce sorulur.
