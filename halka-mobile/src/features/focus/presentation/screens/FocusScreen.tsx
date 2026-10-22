// Odak sekmesi (Pomodoro): mod seçici, nefes alan sayaç halkası, görev etiketi, kontroller ve günlük istatistik
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { strings } from '@core/i18n/tr';
import { durations } from '@core/theme/motion';
import { withAlpha } from '@core/theme/palettes';
import { colors, radius, spacing } from '@core/theme/tokens';
import type { PomodoroMode } from '@domain/entities/Pomodoro';
import { formatTime, useFocusSession } from '@features/focus/presentation/useFocusSession';
import { AppText } from '@presentation/components/common/AppText';
import { IconButton } from '@presentation/components/common/IconButton';
import { ProgressRing } from '@presentation/components/common/ProgressRing';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { Screen } from '@presentation/components/common/Screen';
import { SegmentedControl } from '@presentation/components/common/SegmentedControl';
import { StatCard } from '@presentation/components/common/StatCard';
import { Icon } from '@presentation/components/common/Icon';
import { useColorTransition } from '@presentation/hooks/useColorTransition';
import { hapticSuccess } from '@presentation/utils/haptics';

const t = strings.focus;

const MODE_COLORS: Readonly<Record<PomodoroMode, string>> = {
  work: colors.textPrimary,
  shortBreak: colors.sapphire,
  longBreak: colors.amethyst,
};

const RING_SIZE = 290;
// viewBox 200 içinde: ekranda yarıçap 124, kalınlık 18
const RING_RADIUS = (124 * 200) / RING_SIZE;
const RING_STROKE = (18 * 200) / RING_SIZE;
const GLOW_CYCLE = 4000;
const GLOW_SPREAD = 24;
const DOT_CYCLE = 1400;
const CELEBRATE_HOLD = 2500;

export function FocusScreen() {
  const navigation = useNavigation();
  const reduced = useReducedMotion();
  const {
    pomodoro,
    isRunning,
    remainingSeconds,
    total,
    status,
    task,
    focusMinutes,
    goalPct,
    soundEnabled,
    toggle,
    reset,
    changeMode,
    toggleSound,
    skip,
  } = useFocusSession();

  const color = MODE_COLORS[pomodoro.mode];

  // Arkadaki ışıltı yalnızca çalışırken nefes alır
  const glow = useSharedValue(0);
  useEffect(() => {
    if (!isRunning || reduced) {
      glow.set(withTiming(0, { duration: durations.colorChange }));
      return;
    }
    glow.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: GLOW_CYCLE / 2 }),
          withTiming(0, { duration: GLOW_CYCLE / 2 }),
        ),
        -1,
      ),
    );
  }, [isRunning, reduced, glow]);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: isRunning ? 0.35 + glow.value * 0.35 : 0,
    transform: [{ scale: 1 + glow.value * 0.08 }],
  }));
  const glowColor = useColorTransition(withAlpha(color, '66'), 'borderColor');

  // Görev noktası yanıp söner
  const dot = useSharedValue(1);
  useEffect(() => {
    if (reduced) return;
    dot.set(
      withRepeat(
        withSequence(
          withTiming(0.25, { duration: DOT_CYCLE / 2 }),
          withTiming(1, { duration: DOT_CYCLE / 2 }),
        ),
        -1,
      ),
    );
  }, [reduced, dot]);
  const dotStyle = useAnimatedStyle(() => ({ opacity: dot.value }));

  // Seans bitince başarı titreşimi ve kısa "Tamamlandı" gösterimi
  const celebrate = useSharedValue(0);
  const lastCompleted = useRef(pomodoro.completedSessions);
  useEffect(() => {
    if (pomodoro.completedSessions > lastCompleted.current) {
      hapticSuccess();
      celebrate.set(
        withSequence(
          withTiming(1, { duration: durations.colorChange }),
          withDelay(CELEBRATE_HOLD, withTiming(0, { duration: durations.colorChange })),
        ),
      );
    }
    lastCompleted.current = pomodoro.completedSessions;
  }, [pomodoro.completedSessions, celebrate]);
  const statusStyle = useAnimatedStyle(() => ({ opacity: 1 - celebrate.value }));
  const doneStyle = useAnimatedStyle(() => ({ opacity: celebrate.value }));

  const playColor = useColorTransition(color);

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.topBar}>
        <IconButton
          icon="chevron-left"
          variant="surface"
          size={44}
          accessibilityLabel={t.back}
          onPress={() => navigation.navigate('Main', { screen: 'Today' })}
        />
        <AppText variant="screenTitle" accessibilityRole="header" style={styles.title}>
          {t.title}
        </AppText>
        <IconButton
          icon={soundEnabled ? 'volume-2' : 'volume-x'}
          variant="surface"
          size={44}
          accessibilityLabel={soundEnabled ? t.soundOn : t.soundOff}
          onPress={() => void toggleSound()}
        />
      </View>

      <SegmentedControl<PomodoroMode>
        selected={pomodoro.mode}
        onChange={(mode) => void changeMode(mode)}
        options={(['work', 'shortBreak', 'longBreak'] as const).map((mode) => ({
          value: mode,
          label: t.modes[mode],
          color: MODE_COLORS[mode],
          accessibilityLabel: t.modeA11y(t.modes[mode], pomodoro.durations[mode]),
        }))}
      />

      <View style={styles.stage}>
        <Animated.View style={[styles.glow, glowColor, glowStyle]} pointerEvents="none" />
        <ProgressRing
          size={RING_SIZE}
          duration={durations.tick}
          linear
          rings={[
            {
              progress: total > 0 ? remainingSeconds / total : 0,
              color,
              radius: RING_RADIUS,
              strokeWidth: RING_STROKE,
              trackColor: colors.surfaceAlt,
            },
          ]}
        >
          <AppText
            variant="timer"
            accessibilityLabel={t.timeA11y(formatTime(remainingSeconds))}
            accessibilityLiveRegion="polite"
          >
            {formatTime(remainingSeconds)}
          </AppText>
          <View style={styles.statusBox}>
            <Animated.View style={statusStyle}>
              <AppText variant="small">{status}</AppText>
            </Animated.View>
            <Animated.View style={[styles.statusOverlay, doneStyle]}>
              <AppText variant="small" style={{ color }}>
                {t.done}
              </AppText>
            </Animated.View>
          </View>
        </ProgressRing>
      </View>

      <View style={styles.taskPill} accessible accessibilityLabel={`${t.task} ${task ?? t.noTask}`}>
        <Animated.View style={[styles.dot, dotStyle]} />
        <AppText variant="small">{t.task}</AppText>
        <AppText variant="label" numberOfLines={1} style={styles.taskName}>
          {task ?? t.noTask}
        </AppText>
      </View>

      <View style={styles.spacer} />

      <View style={styles.controls}>
        <IconButton
          icon="rotate-ccw"
          variant="ring"
          size={56}
          iconSize={22}
          accessibilityLabel={t.reset}
          onPress={() => void reset()}
        />
        <ScalePressable
          onPress={() => void toggle()}
          accessibilityLabel={isRunning ? t.pause : t.start}
        >
          <Animated.View style={[styles.play, playColor]}>
            <Icon name={isRunning ? 'pause' : 'play'} size={32} color={colors.textOnAccent} />
          </Animated.View>
        </ScalePressable>
        <IconButton
          icon="skip-forward"
          variant="ring"
          size={56}
          iconSize={22}
          accessibilityLabel={t.skip}
          onPress={() => void skip()}
        />
      </View>

      <View style={styles.stats}>
        <StatCard value={String(pomodoro.completedSessions)} label={t.todaySessions} />
        <StatCard
          value={strings.today.minutes(focusMinutes)}
          label={t.totalFocus}
          color={colors.textPrimary}
        />
        <StatCard value={`%${goalPct}`} label={t.dailyGoal} color={colors.accent} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: spacing.lgx },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { flex: 1, textAlign: 'center' },
  stage: { alignItems: 'center', justifyContent: 'center' },
  // Halkanın etrafında bulanık hale (blur desteklenmeyen platformda yumuşak kenarlık kalır)
  glow: {
    position: 'absolute',
    width: RING_SIZE + GLOW_SPREAD,
    height: RING_SIZE + GLOW_SPREAD,
    borderRadius: (RING_SIZE + GLOW_SPREAD) / 2,
    borderWidth: GLOW_SPREAD,
    // Bulanıklık yalnızca web'de (iOS desteklemez, Android'de sürekli bulanıklık pahalı)
    filter: Platform.OS === 'web' ? `blur(${GLOW_SPREAD}px)` : undefined,
  },
  statusBox: { alignItems: 'center' },
  statusOverlay: { position: 'absolute' },
  taskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: '100%',
    gap: spacing.sm,
    paddingVertical: spacing.smd,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.sapphire },
  taskName: { flexShrink: 1 },
  spacer: { flex: 1, minHeight: spacing.sm },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  play: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: { flexDirection: 'row', gap: spacing.smd },
});
