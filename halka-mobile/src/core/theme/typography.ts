// Hazır yazı stilleri: aile + boyut + satır yüksekliği tek yerde.
// Bileşenler fontFamily/fontSize'ı tek tek yazmak yerine bu stilleri (ya da AppText varyantlarını) kullanır.
// Sayfa/ekran başlıkları serif (Cormorant Garamond 500); gövde, buton ve rakamlar Inter (rakamlar tabular).
import type { TextStyle } from 'react-native';
import { themed } from '@core/theme/themed';
import { colors, fonts, fontSizes } from '@core/theme/tokens';

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
        fontFamily: fonts.serif,
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
        fontFamily: fonts.serif,
        fontSize: fontSizes.greeting,
        lineHeight: 34,
        color: colors.textMain,
      },
      // Sekme ekranlarının üst bar başlığı (Karakterim, Odak…)
      screenTitle: {
        fontFamily: fonts.serif,
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
        fontFamily: fonts.serif,
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
    }) as const satisfies Record<string, TextStyle>,
);

export type TypographyVariant = keyof typeof typography;
