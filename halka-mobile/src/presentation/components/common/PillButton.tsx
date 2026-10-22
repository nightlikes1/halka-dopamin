// Ana buton (56 px, çizgi stil: şeffaf zemin, 1 px kenar, renkli yazı): "Odak seansı başlat" gibi
// birincil eylemler.
// shape 'pill' tam yuvarlak, 'rounded' 18 px köşe.
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, radius, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { Icon, type IconName } from '@presentation/components/common/Icon';
import { ScalePressable } from '@presentation/components/common/ScalePressable';

interface PillButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly icon?: IconName;
  readonly color?: string;
  readonly shape?: 'pill' | 'rounded';
  readonly disabled?: boolean;
  readonly style?: StyleProp<ViewStyle>;
}

export function PillButton({
  label,
  onPress,
  icon,
  color = colors.accent,
  shape = 'rounded',
  disabled = false,
  style,
}: PillButtonProps) {
  return (
    <ScalePressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[
        styles.button,
        { borderColor: color, borderRadius: shape === 'pill' ? radius.full : radius.tile },
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon ? <Icon name={icon} size={20} color={color} /> : null}
        <AppText variant="cardTitle" style={[styles.label, { color }]}>
          {label}
        </AppText>
      </View>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.smd },
  label: { fontFamily: fonts.semibold },
  disabled: { opacity: 0.45 },
});
