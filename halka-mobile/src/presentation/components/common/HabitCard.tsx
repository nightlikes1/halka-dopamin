// Alışkanlık kartı: ikon kutusu · başlık + alt satır (ya da ilerleme çubuğu) · yuvarlak aksiyon.
// Tamamlandı durumuna geçince buton yaylı zıplar ve üstünden kısa bir yazı süzülüp kaybolur.
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { durations, easeOut } from '@core/theme/motion';
import { colors, radius, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { Icon, type IconName } from '@presentation/components/common/Icon';
import { ProgressBar } from '@presentation/components/common/ProgressBar';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { themedStyles } from '@core/theme/themed';

const FLOAT_DISTANCE = 26;

interface HabitCardProps {
  readonly icon: IconName;
  readonly color: string;
  readonly tint: string;
  readonly title: string;
  readonly subtitle?: string;
  // Verilirse alt satır yerine ilerleme çubuğu (0-100)
  readonly progress?: number;
  readonly progressDelay?: number;
  readonly done: boolean;
  // Boş butondaki ikon (varsayılan yok; sayısal kartta 'plus')
  readonly actionIcon?: IconName;
  readonly actionLabel: string;
  readonly onAction: () => void;
  // Tamamlanınca süzülen yazı
  readonly celebrateText?: string;
}

export function HabitCard({
  icon,
  color,
  tint,
  title,
  subtitle,
  progress,
  progressDelay,
  done,
  actionIcon,
  actionLabel,
  onAction,
  celebrateText,
}: HabitCardProps) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const floatY = useSharedValue(0);
  const floatOpacity = useSharedValue(0);
  const wasDone = useRef(done);

  // Yalnızca beklemeden tamamlandıya geçişte kutla (ilk açılışta değil)
  useEffect(() => {
    if (done && !wasDone.current && !reduced) {
      scale.value = withSequence(
        withTiming(0.6, { duration: 0 }),
        withSpring(1.18, { damping: 6, stiffness: 260 }),
        withSpring(1, { damping: 10 }),
      );
      if (celebrateText) {
        floatY.value = 0;
        floatOpacity.value = 1;
        floatY.value = withTiming(-FLOAT_DISTANCE, {
          duration: durations.floatUp,
          easing: easeOut,
        });
        floatOpacity.value = withTiming(0, { duration: durations.floatUp });
      }
    }
    wasDone.current = done;
  }, [done, reduced, celebrateText, scale, floatY, floatOpacity]);

  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const floatStyle = useAnimatedStyle(() => ({
    opacity: floatOpacity.value,
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: tint }]}>
        <Icon name={icon} size={22} color={colors.textPrimary} />
      </View>

      <View style={styles.body}>
        <AppText variant="cardTitle" numberOfLines={1}>
          {title}
        </AppText>
        {progress !== undefined ? (
          <View style={styles.bar}>
            <ProgressBar pct={progress} color={color} height={6} delay={progressDelay} />
          </View>
        ) : subtitle ? (
          <AppText variant="muted" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      <View>
        {celebrateText ? (
          <Animated.View pointerEvents="none" style={[styles.float, floatStyle]}>
            <AppText variant="tag" style={{ color: colors.textSecondary }} numberOfLines={1}>
              {celebrateText}
            </AppText>
          </Animated.View>
        ) : null}
        <Animated.View style={buttonStyle}>
          <ScalePressable
            onPress={onAction}
            accessibilityRole={actionIcon ? 'button' : 'checkbox'}
            aria-checked={actionIcon ? undefined : done}
            accessibilityLabel={actionLabel}
            style={[styles.action, done ? { backgroundColor: colors.gold } : styles.actionEmpty]}
          >
            {done ? (
              <Icon name="check" size={22} color={colors.textOnAccent} />
            ) : actionIcon ? (
              <Icon name={actionIcon} size={20} color={colors.textMain} />
            ) : null}
          </ScalePressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = themedStyles(() => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.mdl,
    paddingVertical: spacing.mdl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: spacing.xs },
  bar: { paddingTop: spacing.xs },
  action: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionEmpty: { borderWidth: 1, borderColor: colors.border },
  float: {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    minWidth: 80,
    alignItems: 'flex-end',
  },
}));
