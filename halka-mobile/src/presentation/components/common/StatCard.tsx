// Küçük istatistik kartı: üstte sayı (isteğe bağlı renkli), altta etiket
import { StyleSheet, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';

interface StatCardProps {
  readonly value: string;
  readonly label: string;
  readonly color?: string;
}

export function StatCard({ value, label, color = colors.textPrimary }: StatCardProps) {
  return (
    <View style={styles.card} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="stat" style={{ color }} numberOfLines={1}>
        {value}
      </AppText>
      <AppText variant="tag" style={styles.label} numberOfLines={2}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.mdl,
    borderRadius: radius.tile,
    backgroundColor: colors.surface,
  },
  label: { color: colors.textSecondary, textAlign: 'center', fontFamily: fonts.medium },
});
