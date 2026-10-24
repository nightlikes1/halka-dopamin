// Ana eylem butonu. solid: ekrandaki birincil eylem, soft: ikincil eylem.
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { layout } from '@core/theme/layout';
import { themedStyles } from '@core/theme/themed';
import { useTheme } from '@core/theme/ThemeProvider';
import { colors, radius, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { Icon, type IconName } from '@presentation/components/common/Icon';

interface ActionButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly color?: string;
  readonly variant?: 'solid' | 'soft';
  readonly icon?: IconName;
  readonly disabled?: boolean;
  readonly style?: StyleProp<ViewStyle>;
}

export function ActionButton({
  label,
  onPress,
  color,
  variant = 'soft',
  icon,
  disabled = false,
  style,
}: ActionButtonProps) {
  const { palette } = useTheme();
  const tint = color ?? palette.accent;
  // Obsidyen ve Şampanya: tüm butonlar çizgi stil; 'solid' yalnızca hafif altın zemin ekler
  const solid = variant === 'solid';
  const textColor = tint;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        { borderColor: tint },
        solid ? styles.solid : null,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon ? <Icon name={icon} size={18} color={textColor} /> : null}
        <AppText variant="subtitle" style={[styles.label, { color: textColor }]}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = themedStyles(() => ({
  button: {
    minHeight: layout.touchTarget + 4,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { textAlign: 'center' },
  solid: { backgroundColor: colors.goldMuted },
  pressed: { backgroundColor: colors.goldMuted, opacity: 0.85 },
  disabled: { opacity: 0.45 },
}));
