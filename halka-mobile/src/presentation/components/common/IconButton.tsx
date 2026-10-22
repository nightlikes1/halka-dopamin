// İkon butonu. Görünen boyut küçük olsa da dokunma alanı hitSlop ile en az 44 px'e tamamlanır.
// outline: kenarlıklı kare · ghost: yalnızca ikon · surface: yuvarlak kart zeminli (üst bar)
// ring: boş daire (2 px kenarlık) · solid: renkli dolu daire
// glass: cam yuvarlak (parçacık üst barı) · glassDark: koyu yarı saydam yuvarlak (dalga üstü kontroller)
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { hitSlopFor } from '@core/theme/layout';
import { colors, radius } from '@core/theme/tokens';
import { Icon, type IconName } from '@presentation/components/common/Icon';
import { ScalePressable } from '@presentation/components/common/ScalePressable';

export type IconButtonVariant =
  'outline' | 'ghost' | 'surface' | 'ring' | 'solid' | 'glass' | 'glassDark';

interface IconButtonProps {
  readonly icon: IconName;
  readonly onPress: () => void;
  readonly accessibilityLabel: string;
  // Görünen boyut (varsayılan 40)
  readonly size?: number;
  readonly tone?: 'default' | 'danger';
  readonly variant?: IconButtonVariant;
  // solid zemin rengi
  readonly color?: string;
  readonly iconSize?: number;
  readonly disabled?: boolean;
  readonly style?: StyleProp<ViewStyle>;
}

const ROUND: readonly IconButtonVariant[] = ['surface', 'ring', 'solid', 'glass', 'glassDark'];

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 40,
  tone = 'default',
  variant = 'outline',
  color = colors.textPrimary,
  iconSize,
  disabled = false,
  style,
}: IconButtonProps) {
  const iconColor =
    variant === 'solid'
      ? colors.textOnAccent
      : tone === 'danger'
        ? colors.textMuted
        : colors.textMain;
  return (
    <ScalePressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={hitSlopFor(size)}
      style={[
        styles.button,
        styles[variant],
        { width: size, height: size },
        ROUND.includes(variant) && { borderRadius: size / 2 },
        variant === 'solid' && { backgroundColor: color },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Icon name={icon} size={iconSize ?? Math.round(size * 0.45)} color={iconColor} />
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  outline: { borderWidth: 1, borderColor: colors.borderGlass, backgroundColor: colors.fillSubtle },
  ghost: { backgroundColor: 'transparent' },
  surface: { backgroundColor: colors.surface },
  ring: { borderWidth: 2, borderColor: colors.border },
  solid: {},
  glass: { borderWidth: 1, borderColor: colors.glassBorder, backgroundColor: colors.glass },
  glassDark: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassControl,
  },
  disabled: { opacity: 0.45 },
});
