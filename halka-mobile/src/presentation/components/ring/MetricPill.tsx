// Merkezdeki küçük metrik rozeti
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { Icon, type IconName } from '@presentation/components/common/Icon';

interface MetricPillProps {
  readonly icon: IconName;
  readonly value: string;
  readonly label?: string;
  readonly hint?: boolean;
}

export function MetricPill({ icon, value, label, hint = false }: MetricPillProps) {
  return (
    <View
      style={[styles.pill, hint && styles.hint]}
      accessibilityLabel={label ? `${label}: ${value}` : value}
    >
      <Icon name={icon} size={14} color={colors.textMuted} />
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    backgroundColor: colors.fillSubtle,
  },
  hint: { borderStyle: 'dashed' },
});
