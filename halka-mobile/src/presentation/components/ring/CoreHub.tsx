// Halkanın ortasındaki cam çekirdek: aktif eklenti sayısı, saat, tarih, selamlama
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { themedStyles } from '@core/theme/themed';
import { withAlpha } from '@core/theme/palettes';
import { useTheme } from '@core/theme/ThemeProvider';
import { colors, fonts, fontSizes, spacing } from '@core/theme/tokens';
import type { DailyBriefing } from '@domain/entities/Briefing';
import { AppText } from '@presentation/components/common/AppText';
import { Icon } from '@presentation/components/common/Icon';
import { LiveClock } from '@presentation/components/ring/LiveClock';

interface CoreHubProps {
  readonly diameter: number;
  readonly briefing: DailyBriefing;
  readonly onEditName: () => void;
}

export function CoreHub({ diameter, briefing, onEditName }: CoreHubProps) {
  const { palette } = useTheme();
  const pulse = useSharedValue(0.4);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const scale = diameter / 300;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.hub,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          borderColor: withAlpha(palette.accent, '33'),
        },
      ]}
    >
      <View style={styles.emblem}>
        <Animated.View style={[styles.dot, { backgroundColor: palette.accent }, dotStyle]} />
        <AppText style={[styles.emblemText, { color: colors.textSecondary }]}>
          {briefing.activeCount} Halka Eklentisi
        </AppText>
      </View>

      <LiveClock fontSize={Math.round(44 * scale)} />
      <AppText variant="muted" style={styles.center}>
        {briefing.dateText}
      </AppText>

      <View style={styles.greetingRow}>
        <AppText style={[styles.greeting, { fontSize: Math.round(17 * scale) }]}>
          {briefing.greeting},{' '}
        </AppText>
        <Pressable
          onPress={onEditName}
          accessibilityRole="button"
          accessibilityLabel="İsmi düzenle"
          hitSlop={12}
          style={({ pressed }) => [styles.nameButton, pressed && styles.pressed]}
        >
          <AppText
            style={[
              styles.greeting,
              styles.name,
              { color: colors.textPrimary, fontSize: Math.round(17 * scale) },
            ]}
            numberOfLines={1}
          >
            {briefing.userName}
          </AppText>
          <Icon name="edit-2" size={Math.round(13 * scale)} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = themedStyles(() => ({
  hub: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.lg,
    borderWidth: 1,
    backgroundColor: colors.scrim,
  },
  emblem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 7, height: 7, borderRadius: 4 },
  emblemText: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  center: { textAlign: 'center' },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  greeting: { fontFamily: fonts.semibold, color: colors.textMain },
  name: { textDecorationLine: 'underline', textDecorationStyle: 'dotted' },
  nameButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  pressed: { opacity: 0.6 },
}));
