// "Sıradakiler" satırı (parçacık stili): 58 px cam kart, solda renkli nokta, sağda 44 px yuvarlak buton.
// Dolu buton = tamamlandı + tik, boş buton = ince kenarlık (ya da verilen ikon).
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { Icon, type IconName } from '@presentation/components/common/Icon';
import { ScalePressable } from '@presentation/components/common/ScalePressable';

const ROW_HEIGHT = 58;
const DOT = 8;
const ACTION = 44;

interface GlassHabitRowProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly color: string;
  readonly done: boolean;
  readonly actionIcon?: IconName;
  readonly actionLabel: string;
  readonly onAction: () => void;
}

export function GlassHabitRow({
  title,
  subtitle,
  color,
  done,
  actionIcon,
  actionLabel,
  onAction,
}: GlassHabitRowProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.body}>
        <AppText variant="label" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="dim" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <ScalePressable
        onPress={onAction}
        accessibilityRole={actionIcon ? 'button' : 'checkbox'}
        aria-checked={actionIcon ? undefined : done}
        accessibilityLabel={actionLabel}
        style={[styles.action, done ? { backgroundColor: color } : styles.actionEmpty]}
      >
        {done ? (
          <Icon name="check" size={20} color={colors.ink} />
        ) : actionIcon ? (
          <Icon name={actionIcon} size={18} color={colors.textPrimary} />
        ) : null}
      </ScalePressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    borderRadius: radius.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
  },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
  body: { flex: 1, gap: spacing.xxs },
  action: {
    width: ACTION,
    height: ACTION,
    borderRadius: ACTION / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionEmpty: { borderWidth: 1, borderColor: colors.glassStrong },
});
