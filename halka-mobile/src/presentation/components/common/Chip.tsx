// Hap buton: seçim, filtre ve ikincil eylemler için. Varsayılan boyut 44 px dokunma alanı sağlar.
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { hitSlopFor } from '@core/theme/layout';
import { themedStyles } from '@core/theme/themed';
import { withAlpha } from '@core/theme/palettes';
import { colors, radius, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { Icon, type IconName } from '@presentation/components/common/Icon';

export type ChipVariant = 'default' | 'primary' | 'active';
export type ChipSize = 'sm' | 'md';

const HEIGHT: Record<ChipSize, number> = { sm: 32, md: 44 };

interface ChipProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: ChipVariant;
  readonly size?: ChipSize;
  readonly icon?: IconName;
  readonly accent?: string;
  readonly disabled?: boolean;
  readonly accessibilityLabel?: string;
  readonly style?: StyleProp<ViewStyle>;
}

export function Chip({
  label,
  onPress,
  variant = 'default',
  size = 'md',
  icon,
  accent,
  disabled = false,
  accessibilityLabel,
  style,
}: ChipProps) {
  const highlighted = variant !== 'default';
  const textColor = colors.textMain;
  const iconColor = accent ?? textColor;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled, selected: variant === 'active' }}
      hitSlop={hitSlopFor(HEIGHT[size])}
      style={({ pressed }) => [
        styles.chip,
        { minHeight: HEIGHT[size] },
        size === 'sm' ? styles.small : styles.medium,
        highlighted && {
          backgroundColor: colors.goldMuted,
          borderColor: withAlpha(colors.gold, '59'),
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon ? <Icon name={icon} size={size === 'sm' ? 14 : 16} color={iconColor} /> : null}
        <AppText variant="label" style={{ color: textColor }}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = themedStyles(() => ({
  chip: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    backgroundColor: colors.fillSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medium: { paddingHorizontal: spacing.lg },
  small: { paddingHorizontal: spacing.md },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  pressed: { backgroundColor: colors.fillStrong },
  disabled: { opacity: 0.45 },
}));
