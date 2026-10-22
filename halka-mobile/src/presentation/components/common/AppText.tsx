// Uygulama fontlarını kullanan metin bileşeni. Varyantlar core/theme/typography.ts'ten gelir.
import { StyleSheet, Text, type TextProps } from 'react-native';
import { typography, type TypographyVariant } from '@core/theme/typography';

export type AppTextVariant = TypographyVariant;

// Satır yüksekliği verilmeden büyütülen metinde varyantın satır yüksekliği taşmaya yol açar
const LINE_HEIGHT_RATIO = 1.3;

interface AppTextProps extends TextProps {
  readonly variant?: AppTextVariant;
}

export function AppText({ variant = 'body', style, ...rest }: AppTextProps) {
  const base = typography[variant];
  const flat = StyleSheet.flatten(style);
  const needsLineHeight =
    flat?.fontSize !== undefined &&
    flat.lineHeight === undefined &&
    flat.fontSize !== base.fontSize;
  return (
    <Text
      {...rest}
      style={[
        base,
        style,
        needsLineHeight && { lineHeight: Math.round((flat.fontSize ?? 0) * LINE_HEIGHT_RATIO) },
      ]}
    />
  );
}
