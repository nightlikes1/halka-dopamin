// Rozet: renkli yuvarlak ikon + kısa etiket. Kilitliyse kesikli kenarlık, gri kilit ikonu.
// delay verilirse sırayla zıplayarak belirir.
import { View } from 'react-native';
import { colors, fonts, radius, spacing } from '@core/theme/tokens';
import { Appear } from '@presentation/components/common/Appear';
import { AppText } from '@presentation/components/common/AppText';
import { Icon, type IconName } from '@presentation/components/common/Icon';
import { themedStyles } from '@core/theme/themed';

interface BadgeProps {
  readonly icon: IconName;
  readonly label: string;
  readonly color: string;
  readonly tint: string;
  readonly locked?: boolean;
  readonly delay?: number;
}

export function Badge({ icon, label, color, tint, locked = false, delay = 0 }: BadgeProps) {
  return (
    <Appear variant="pop" delay={delay} style={styles.cell}>
      <View
        style={[styles.card, locked && styles.locked]}
        accessible
        accessibilityLabel={locked ? `${label}, kilitli` : label}
      >
        <View style={[styles.circle, { backgroundColor: locked ? colors.surfaceAlt : tint }]}>
          <Icon name={locked ? 'lock' : icon} size={20} color={locked ? colors.textDim : color} />
        </View>
        <AppText
          variant="tag"
          numberOfLines={2}
          style={[styles.label, locked && styles.labelLocked]}
        >
          {label}
        </AppText>
      </View>
    </Appear>
  );
}

const styles = themedStyles(() => ({
  cell: { flex: 1 },
  card: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.mdl,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.tile,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
  },
  locked: {
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: 'transparent',
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { textAlign: 'center', fontFamily: fonts.semibold },
  labelLocked: { color: colors.textSecondary },
}));
