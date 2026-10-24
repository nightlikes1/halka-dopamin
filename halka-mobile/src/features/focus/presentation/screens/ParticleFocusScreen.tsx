// Odak sekmesi (parçacık stili): arka planda parçacık dalga (sayaç çalışırken yükselir),
// cam üst bar ve mod seçici, büyük ince sayaç, ilerleme çizgisi, dalga üstünde kontroller.
// Sayaç mantığı mevcut Pomodoro use-case'lerinden (useFocusSession).
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { durations } from '@core/theme/motion';
import { colors, radius, spacing } from '@core/theme/tokens';
import type { PomodoroMode } from '@domain/entities/Pomodoro';
import { formatTime, useFocusSession } from '@features/focus/presentation/useFocusSession';
import { AppText } from '@presentation/components/common/AppText';
import { Icon } from '@presentation/components/common/Icon';
import { IconButton } from '@presentation/components/common/IconButton';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { SegmentedControl } from '@presentation/components/common/SegmentedControl';
import { themedStyles, themed } from '@core/theme/themed';
import { useTabBarClearance } from '@presentation/navigation/GlassTabBar';
import { BlinkDot } from '@presentation/particles/components/BlinkDot';
import { ParticleWave } from '@presentation/particles/components/ParticleWave';
import type { ParticlePaletteName } from '@presentation/particles/engine/palette';
import { useParticlePointer } from '@presentation/particles/renderer/useParticlePointer';
import { hapticSuccess } from '@presentation/utils/haptics';

const t = strings.focus;

// Mod paleti: odak varsayılan palet, kısa mola buz, uzun mola mor
const MODE_PALETTE: Readonly<Record<PomodoroMode, ParticlePaletteName>> = {
  work: 'buzAtes',
  shortBreak: 'buz',
  longBreak: 'mor',
};
const MODE_COLOR: Readonly<Record<PomodoroMode, string>> = themed(() => ({
  work: colors.textPrimary,
  shortBreak: colors.sapphire,
  longBreak: colors.amethyst,
}));
const MODES: readonly PomodoroMode[] = ['work', 'shortBreak', 'longBreak'];

const LINE_WIDTH = 180;
const LINE_HEIGHT = 2;
const CELEBRATE_HOLD = 2500;

export function ParticleFocusScreen() {
  const navigation = useNavigation();
  const clearance = useTabBarClearance();
  // Boş alana dokunmak dalgada dalgacık yaratır (kontroller normal çalışır)
  const { channel, targetRef, handlers } = useParticlePointer();
  const {
    pomodoro,
    isRunning,
    remainingSeconds,
    total,
    status,
    task,
    soundEnabled,
    toggle,
    reset,
    changeMode,
    toggleSound,
    skip,
  } = useFocusSession();
  const modeColor = MODE_COLOR[pomodoro.mode];
  const elapsed = total > 0 ? 1 - remainingSeconds / total : 0;

  // İlerleme çizgisi her saniye doğrusal ilerler
  const line = useSharedValue(elapsed);
  useEffect(() => {
    line.set(withTiming(elapsed, { duration: durations.tick, easing: Easing.linear }));
  }, [elapsed, line]);
  const lineStyle = useAnimatedStyle(() => ({ width: line.value * LINE_WIDTH }));

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

  return (
    <View ref={targetRef} style={styles.root} {...handlers}>
      <ParticleWave
        intensity={isRunning ? 1 : 0}
        palette={MODE_PALETTE[pomodoro.mode]}
        pointer={channel}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.content, { paddingBottom: clearance }]}>
          <View style={styles.topBar}>
            <IconButton
              icon="chevron-left"
              variant="glass"
              size={44}
              accessibilityLabel={t.back}
              onPress={() => navigation.navigate('Main', { screen: 'Today' })}
            />
            <AppText variant="screenTitle" accessibilityRole="header" style={styles.title}>
              {t.title}
            </AppText>
            <IconButton
              icon={soundEnabled ? 'volume-2' : 'volume-x'}
              variant="glass"
              size={44}
              accessibilityLabel={soundEnabled ? t.soundOn : t.soundOff}
              onPress={() => void toggleSound()}
            />
          </View>

          <SegmentedControl<PomodoroMode>
            glass
            selected={pomodoro.mode}
            onChange={(mode) => void changeMode(mode)}
            options={MODES.map((mode) => ({
              value: mode,
              label: t.modes[mode],
              color: colors.textPrimary,
              accessibilityLabel: t.modeA11y(t.modes[mode], pomodoro.durations[mode]),
            }))}
          />

          <View style={styles.timerBlock}>
            <AppText
              variant="timerXL"
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
                <AppText variant="small" style={{ color: colors.gold }}>
                  {t.done}
                </AppText>
              </Animated.View>
            </View>
            <View style={styles.line}>
              <Animated.View style={[styles.lineFill, { backgroundColor: modeColor }, lineStyle]} />
            </View>
          </View>

          <View
            style={styles.taskPill}
            accessible
            accessibilityLabel={`${t.task} ${task ?? t.noTask}`}
          >
            <BlinkDot color={modeColor} size={8} />
            <AppText variant="small">{t.task}</AppText>
            <AppText variant="label" numberOfLines={1} style={styles.taskName}>
              {task ?? t.noTask}
            </AppText>
          </View>

          <View style={styles.spacer} />

          <View style={styles.controls}>
            <IconButton
              icon="rotate-ccw"
              variant="glassDark"
              size={56}
              iconSize={22}
              accessibilityLabel={t.reset}
              onPress={() => void reset()}
            />
            <ScalePressable
              onPress={() => void toggle()}
              accessibilityLabel={isRunning ? t.pause : t.start}
              style={styles.play}
            >
              <Icon name={isRunning ? 'pause' : 'play'} size={30} color={colors.ink} />
            </ScalePressable>
            <IconButton
              icon="skip-forward"
              variant="glassDark"
              size={56}
              iconSize={22}
              accessibilityLabel={t.skip}
              onPress={() => void skip()}
            />
          </View>
          <AppText variant="dim" style={styles.reward}>
            {t.sessionReward}
          </AppText>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = themedStyles(() => ({
  root: { flex: 1, backgroundColor: colors.ink },
  safe: { flex: 1 },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    gap: spacing.lgx,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { flex: 1, textAlign: 'center' },
  timerBlock: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl },
  statusBox: { alignItems: 'center' },
  statusOverlay: { position: 'absolute' },
  line: {
    width: LINE_WIDTH,
    height: LINE_HEIGHT,
    borderRadius: LINE_HEIGHT,
    backgroundColor: colors.glassStrong,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  lineFill: { height: '100%' },
  taskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: '100%',
    gap: spacing.sm,
    paddingVertical: spacing.smd,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
  },
  taskName: { flexShrink: 1 },
  spacer: { flex: 1, minHeight: spacing.sm },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  play: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textPrimary,
  },
  reward: { textAlign: 'center' },
}));
