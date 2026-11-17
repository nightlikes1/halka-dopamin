// Yeni düzenin butonu: ana buton dolu turuncu→pembe gradyan kapsül (beyaz kalın yazı), ikincil buton
// koyu kapsül. Bir ekranda tek ana buton olur.
import { useId } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { layout } from '@core/theme/layout';
import { colors, fonts, fontSizes, gradients, radius, spacing } from '@core/theme/tokens';
import { themedStyles } from '@core/theme/themed';
import { AppText } from '@presentation/components/common/AppText';
import { Icon, type IconName } from '@presentation/components/common/Icon';
import { ScalePressable } from '@presentation/components/common/ScalePressable';

interface CapsuleButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: 'primary' | 'secondary';
  readonly icon?: IconName;
  // Ana butonun gradyanı (varsayılan ödül; odakta "focus", nefeste "breath")
  readonly gradient?: readonly string[];
  readonly disabled?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly accessibilityLabel?: string;
}

export function CapsuleButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  gradient = gradients.reward,
  disabled = false,
  style,
  accessibilityLabel,
}: CapsuleButtonProps) {
  const id = useId().replace(/:/g, '');
  const primary = variant === 'primary';
  const textColor = primary ? colors.textOnAccent : colors.textPrimary;
  return (
    <ScalePressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={[styles.base, !primary && styles.secondary, disabled && styles.disabled, style]}
    >
      {primary ? (
        <View style={styles.fill} pointerEvents="none">
          <Svg width="100%" height="100%" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id={`cb${id}`} x1="0" y1="0" x2="1" y2="0">
                {gradient.map((color, index) => (
                  <Stop
                    key={`${color}-${index}`}
                    offset={gradient.length > 1 ? index / (gradient.length - 1) : 0}
                    stopColor={color}
                  />
                ))}
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill={`url(#cb${id})`} />
          </Svg>
        </View>
      ) : null}
      {icon ? <Icon name={icon} size={20} color={textColor} /> : null}
      <AppText variant="bodyStrong" style={[styles.label, { color: textColor }]}>
        {label}
      </AppText>
    </ScalePressable>
  );
}

const styles = themedStyles(() => ({
  base: {
    minHeight: layout.primaryButtonHeight,
    borderRadius: radius.full,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  secondary: { backgroundColor: colors.surfaceAlt },
  disabled: { opacity: 0.5 },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  label: { fontFamily: fonts.bold, fontSize: fontSizes.bodyL },
}));
