// Hazır yazı stilleri: aile + boyut + satır yüksekliği tek yerde.
// Bileşenler fontFamily/fontSize'ı tek tek yazmak yerine bu stilleri (ya da AppText varyantlarını) kullanır.
// Başlıklar aileye göre: Obsidyen'de serif (Cormorant Garamond 500), Halka'da kalın Inter (themeTraits.titleFont);
// gövde, buton ve rakamlar Inter (rakamlar tabular).
import type { TextStyle } from 'react-native';
import { themed } from '@core/theme/themed';
import { colors, fonts, fontSizes, themeTraits } from '@core/theme/tokens';

// Renkler aktif temadan okunur (themed)
export const typography = themed(
  () =>
    ({
      // Büyük sayılar (yakınlık, sayaç)
      display: {
        fontFamily: fonts.mono,
        fontSize: fontSizes.hero,
        lineHeight: 60,
        fontVariant: ['tabular-nums'],
        color: colors.textMain,
      },
      // Ekran başlığı
      headline: {
        fontFamily: themeTraits.titleFont,
        fontSize: fontSizes.xl,
        lineHeight: 30,
        color: colors.textMain,
      },
      // Kart / diyalog başlığı
      title: {
        fontFamily: fonts.bold,
        fontSize: fontSizes.lg,
        lineHeight: 24,
        color: colors.textMain,
      },
      // Bölüm başlığı, öne çıkan satır
      subtitle: {
        fontFamily: fonts.semibold,
        fontSize: fontSizes.md,
        lineHeight: 21,
        color: colors.textMain,
      },
      body: {
        fontFamily: fonts.regular,
        fontSize: fontSizes.md,
        lineHeight: 22,
        color: colors.textMain,
      },
      muted: {
        fontFamily: fonts.regular,
        fontSize: fontSizes.sm,
        lineHeight: 19,
        color: colors.textMuted,
      },
      dim: {
        fontFamily: fonts.regular,
        fontSize: fontSizes.xs,
        lineHeight: 16,
        color: colors.textDim,
      },
      label: {
        fontFamily: fonts.semibold,
        fontSize: fontSizes.sm,
        lineHeight: 18,
        color: colors.textMain,
      },
      // Küçük, büyük harfli bölüm etiketi
      caption: {
        fontFamily: fonts.medium,
        fontSize: fontSizes.xs,
        lineHeight: 16,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        color: colors.textDim,
      },
      mono: {
        fontFamily: fonts.mono,
        fontSize: fontSizes.md,
        lineHeight: 22,
        fontVariant: ['tabular-nums'],
        color: colors.textMain,
      },
      // Bugün ekranı selamı
      greeting: {
        fontFamily: themeTraits.titleFont,
        fontSize: fontSizes.greeting,
        lineHeight: 34,
        color: colors.textMain,
      },
      // Sekme ekranlarının üst bar başlığı (Karakterim, Odak…)
      screenTitle: {
        fontFamily: themeTraits.titleFont,
        fontSize: fontSizes.lg,
        lineHeight: 24,
        color: colors.textMain,
      },
      // Bölüm başlığı (Alışkanlıklarım, Özellikler…)
      section: {
        fontFamily: fonts.semibold,
        fontSize: fontSizes.lg,
        lineHeight: 24,
        color: colors.textMain,
      },
      cardTitle: {
        fontFamily: fonts.semibold,
        fontSize: fontSizes.cardTitle,
        lineHeight: 21,
        color: colors.textMain,
      },
      // Alt metin / ikincil satır
      small: {
        fontFamily: fonts.regular,
        fontSize: fontSizes.body,
        lineHeight: 20,
        color: colors.textMuted,
      },
      // Küçük etiket (rozet adı, sekme etiketi)
      tag: {
        fontFamily: fonts.semibold,
        fontSize: fontSizes.tag,
        lineHeight: 16,
        color: colors.textMain,
      },
      // İstatistik sayısı (tabular rakam)
      stat: {
        fontFamily: fonts.semibold,
        fontSize: fontSizes.stat,
        lineHeight: 26,
        fontVariant: ['tabular-nums'],
        color: colors.textMain,
      },
      // Pomodoro sayacı
      timer: {
        fontFamily: fonts.bold,
        fontSize: fontSizes.timer,
        lineHeight: 74,
        letterSpacing: -1,
        fontVariant: ['tabular-nums'],
        color: colors.textMain,
      },
      // Parçacık ekranları: ince ağırlıklı büyük yazılar
      brand: {
        fontFamily: fonts.semibold,
        fontSize: fontSizes.sm,
        lineHeight: 18,
        letterSpacing: 5,
        color: colors.textMain,
      },
      particleTitle: {
        fontFamily: themeTraits.titleFont,
        fontSize: fontSizes.particleTitle,
        lineHeight: 43,
        color: colors.textMain,
      },
      particleBody: {
        fontFamily: fonts.regular,
        fontSize: fontSizes.md,
        lineHeight: 22,
        color: colors.textMuted,
      },
      particleCaption: {
        fontFamily: fonts.medium,
        fontSize: fontSizes.xs,
        lineHeight: 15,
        letterSpacing: 2.5,
        color: colors.textMuted,
      },
      ringValue: {
        fontFamily: fonts.thin,
        fontSize: fontSizes.ringValue58,
        lineHeight: 64,
        fontVariant: ['tabular-nums'],
        color: colors.textMain,
      },
      timerXL: {
        fontFamily: fonts.thin,
        fontSize: fontSizes.timerXL,
        lineHeight: 100,
        letterSpacing: -3,
        fontVariant: ['tabular-nums'],
        color: colors.textMain,
      },
      // Yeni düzen ölçeği (iki ailede aynı boyutlar)
      // 34: sekme ekranı adı (Bugün, Odak, Araçlar, Gelişim)
      largeTitle: {
        fontFamily: themeTraits.titleFont,
        fontSize: fontSizes.xxl,
        lineHeight: 41,
        color: colors.textPrimary,
      },
      // 28: tek görevli akış ekranı başlığı
      flowTitle: {
        fontFamily: themeTraits.titleFont,
        fontSize: fontSizes.greeting,
        lineHeight: 34,
        color: colors.textPrimary,
      },
      // 22: bölüm başlığı
      sectionTitle: {
        fontFamily: fonts.bold,
        fontSize: fontSizes.sectionTitle,
        lineHeight: 28,
        color: colors.textPrimary,
      },
      // 20: kart / panel başlığı
      panelTitle: {
        fontFamily: fonts.semibold,
        fontSize: fontSizes.panelTitle,
        lineHeight: 25,
        color: colors.textPrimary,
      },
      // 17: satır ve buton
      bodyL: {
        fontFamily: fonts.regular,
        fontSize: fontSizes.bodyL,
        lineHeight: 22,
        color: colors.textPrimary,
      },
      bodyStrong: {
        fontFamily: fonts.semibold,
        fontSize: fontSizes.bodyL,
        lineHeight: 22,
        color: colors.textPrimary,
      },
      // 15: ikincil metin
      secondary: {
        fontFamily: fonts.regular,
        fontSize: fontSizes.md,
        lineHeight: 20,
        color: colors.textSecondary,
      },
      // 13: not, alt yazı
      note: {
        fontFamily: fonts.regular,
        fontSize: fontSizes.sm,
        lineHeight: 18,
        color: colors.textSecondary,
      },
      // 13: BÜYÜK HARF bölüm etiketi
      overline: {
        fontFamily: fonts.semibold,
        fontSize: fontSizes.sm,
        lineHeight: 18,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        color: colors.textSecondary,
      },
      // 12: rozet, grafik
      footnote: {
        fontFamily: fonts.medium,
        fontSize: fontSizes.tag,
        lineHeight: 16,
        color: colors.textSecondary,
      },
      // 10: yalnız sekme etiketi
      tabLabel: {
        fontFamily: fonts.semibold,
        fontSize: fontSizes.tabLabel,
        lineHeight: 12,
        color: colors.textSecondary,
      },
      // Büyük rakamlar: yalnız 54 ve 40
      numeralXL: {
        fontFamily: fonts.bold,
        fontSize: fontSizes.numeralXL,
        lineHeight: 60,
        letterSpacing: -1,
        fontVariant: ['tabular-nums'],
        color: colors.textPrimary,
      },
      numeralL: {
        fontFamily: fonts.bold,
        fontSize: fontSizes.numeralL,
        lineHeight: 46,
        letterSpacing: -0.5,
        fontVariant: ['tabular-nums'],
        color: colors.textPrimary,
      },
    }) as const satisfies Record<string, TextStyle>,
);

export type TypographyVariant = keyof typeof typography;
