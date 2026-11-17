// Çember şeridi: üst üste binen baş harfler + durum noktası. Yalnız görüntü (örnek veri).
import { View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { themedStyles } from '@core/theme/themed';
import { colors, moduleColors, spacing } from '@core/theme/tokens';
import type { Circle, CircleStatus } from '@features/today/domain/entities';
import { AppText } from '@presentation/components/common/AppText';
import { InitialAvatar } from '@presentation/components/common/InitialAvatar';

const AVATAR = 28;
const DOT = 9;

const statusColor = (status: CircleStatus): string =>
  status === 'balanced'
    ? moduleColors.success
    : status === 'struggling'
      ? moduleColors.mood
      : colors.textDisabled;

export function CircleStrip({ circle }: { readonly circle: Circle }) {
  const names = circle.members.map((member) => member.name).join(', ');
  return (
    <View style={styles.row} accessible accessibilityLabel={strings.today.circleA11y(names)}>
      <View style={styles.faces}>
        {circle.members.map((member, index) => (
          <View key={member.id} style={[styles.face, index > 0 && styles.overlap]}>
            <InitialAvatar name={member.name} size={AVATAR} />
            <View style={[styles.dot, { backgroundColor: statusColor(member.status) }]} />
          </View>
        ))}
      </View>
      <AppText variant="footnote" style={styles.label}>
        {strings.today.circleLabel}
      </AppText>
    </View>
  );
}

const styles = themedStyles(() => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  faces: { flexDirection: 'row' },
  face: { borderRadius: AVATAR / 2, borderWidth: 2, borderColor: colors.surface },
  overlap: { marginLeft: -spacing.sm },
  dot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  label: { color: colors.textSecondary },
}));
