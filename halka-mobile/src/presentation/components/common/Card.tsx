// Kart yüzeyi: ekranlardaki gruplanmış içerik için tek tip kutu
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@core/theme/tokens';
import { themedStyles } from '@core/theme/themed';

// surface: ana kart · raised: kart içindeki alt yüzey · outline: zeminsiz çerçeve · dashed: boş durum
export type CardVariant = 'surface' | 'raised' | 'outline' | 'dashed';
export type CardPadding = 'none' | 'md' | 'lg';

interface CardProps {
  readonly children: ReactNode;
  readonly variant?: CardVariant;
  readonly padding?: CardPadding;
  readonly style?: StyleProp<ViewStyle>;
}

export function Card({ children, variant = 'surface', padding = 'lg', style }: CardProps) {
  return <View style={[styles.base, styles[variant], paddings[padding], style]}>{children}</View>;
}

const paddings = themedStyles(() => ({
  none: { padding: 0 },
  md: { padding: spacing.md },
  lg: { padding: spacing.lg },
}));

const styles = themedStyles(() => ({
  base: { gap: spacing.md, borderRadius: radius.lg },
  surface: { borderWidth: 1, borderColor: colors.borderGlass, backgroundColor: colors.bgCard },
  raised: { borderRadius: radius.md, backgroundColor: colors.bgCardPressed },
  outline: { borderWidth: 1, borderColor: colors.borderGlass },
  dashed: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderStrong },
}));
