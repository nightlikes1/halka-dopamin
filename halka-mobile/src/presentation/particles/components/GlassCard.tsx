// Cam kart (parçacık ekranları): saydam zemin, ince açık kenarlık, 16 px köşe
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@core/theme/tokens';
import { themedStyles } from '@core/theme/themed';

interface GlassCardProps {
  readonly children: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export function GlassCard({ children, style }: GlassCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = themedStyles(() => ({
  card: {
    borderRadius: radius.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
    padding: spacing.mdl,
  },
}));
