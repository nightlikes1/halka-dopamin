// Yeni düzenin kart/panel yüzeyi (24 köşe). Liquid Glass stilinde yarı saydam cam + ince açık kenar,
// düz stilde opak kart.
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@core/theme/tokens';
import { themedStyles } from '@core/theme/themed';
import { useParticleStyle } from '@presentation/store/usePreferencesStore';

interface PanelProps {
  readonly children: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  // Küçük satır kartı (alan köşesi değil, aynı 24 köşe; yalnız iç boşluk daralır)
  readonly compact?: boolean;
}

export function Panel({ children, style, compact = false }: PanelProps) {
  const glass = useParticleStyle();
  return (
    <View
      style={[styles.base, compact && styles.compact, glass ? styles.glass : styles.flat, style]}
    >
      {children}
    </View>
  );
}

const styles = themedStyles(() => ({
  base: { borderRadius: radius.card, padding: spacing.lg },
  compact: { paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  glass: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder },
  flat: { backgroundColor: colors.surface },
}));
