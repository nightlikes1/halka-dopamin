// Seri rozeti: sürekli hafifçe büyüyüp sallanan turuncu alev + gün sayısı
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { strings } from '@core/i18n/tr';
import { colors, fonts, fontSizes, radius, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { Icon } from '@presentation/components/common/Icon';
import { themedStyles } from '@core/theme/themed';

const FLAME_CYCLE = 1600;

export function StreakPill({ days }: { readonly days: number }) {
  const reduced = useReducedMotion();
  const phase = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    phase.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: FLAME_CYCLE / 2 }),
          withTiming(0, { duration: FLAME_CYCLE / 2 }),
        ),
        -1,
      ),
    );
  }, [reduced, phase]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + phase.value * 0.15 }, { rotate: `${(phase.value - 0.5) * 8}deg` }],
  }));

  return (
    <View style={styles.pill} accessible accessibilityLabel={strings.today.streakA11y(days)}>
      <Animated.View style={flameStyle}>
        <Icon name="flame" size={18} color={colors.accent} />
      </Animated.View>
      <AppText variant="body" style={styles.text}>
        {strings.today.streak(days)}
      </AppText>
    </View>
  );
}

const styles = themedStyles(() => ({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.mdl,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
  },
  text: { fontFamily: fonts.bold, fontSize: fontSizes.body, color: colors.accent },
}));
