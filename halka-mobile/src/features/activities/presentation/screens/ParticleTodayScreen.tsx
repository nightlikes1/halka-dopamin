// Bugün sekmesi (parçacık stili): parçacık halka (bugünün alışkanlık oranı), üç cam kart,
// "Sıradakiler" listesi, odak seansı ve akşam check-in. Veriler klasik ekranla aynı hook'lardan.
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { staggers } from '@core/theme/motion';
import { colors, spacing } from '@core/theme/tokens';
import { resolveGreetingName } from '@domain/entities/Profile';
import { formatWeekdayDayMonth } from '@core/utils/date';
import { SESSIONS_BEFORE_LONG_BREAK } from '@domain/entities/Pomodoro';
import { getGreeting } from '@domain/services/briefingGenerator';
import { GlassHabitRow } from '@features/activities/presentation/components/GlassHabitRow';
import { SwipeToComplete } from '@presentation/components/common/SwipeToComplete';
import { isCompleted, summarizeToday } from '@features/activities/presentation/todaySummary';
import { useTodayHabits } from '@features/activities/presentation/useTodayHabits';
import { useAuth } from '@features/auth/presentation/useAuth';
import { useCharacter } from '@features/character/presentation/useCharacter';
import { CheckInCard } from '@features/checkin/presentation/components/CheckInCard';
import { useCheckInOverview } from '@features/checkin/presentation/useCheckInOverview';
import { ThemeToggleButton } from '@features/settings/presentation/components/ThemeToggleButton';
import type { Habit, HabitEntryStatus } from '@features/habits/domain/entities';
import { Appear } from '@presentation/components/common/Appear';
import { AppText } from '@presentation/components/common/AppText';
import { IconButton } from '@presentation/components/common/IconButton';
import { PillButton } from '@presentation/components/common/PillButton';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { Screen } from '@presentation/components/common/Screen';
import { useNow } from '@presentation/hooks/useNow';
import { useProfile } from '@presentation/hooks/useProfile';
import { useStreak } from '@presentation/hooks/useStreak';
import { useWater } from '@presentation/hooks/useWater';
import { GlassCard } from '@presentation/particles/components/GlassCard';
import { ParticleRing } from '@presentation/particles/components/ParticleRing';
import { RING_CY, RING_R } from '@presentation/particles/engine/ringEngine';
import { REFERENCE_WIDTH } from '@presentation/particles/engine/types';
import { useSnapshotSlice } from '@presentation/store/useHalkaStore';
import { hapticLight } from '@presentation/utils/haptics';

const t = strings.today;
const p = strings.particleToday;
const WATER_STEP_ML = 250;
// Halkanın altındaki toz alanı (referans px): kartlar bu alanın üstüne biner
const RING_VISIBLE_HEIGHT = RING_CY + RING_R + 70;
// Satır noktaları paletin sıcak, pembe ve soğuk renkleri arasında döner
const DOT_COLORS = [colors.amber, colors.ruby, colors.amethyst] as const;

const doneStatusFor = (habit: Habit): HabitEntryStatus =>
  habit.kind === 'build' ? 'done' : 'clean';

function habitSubtitle(habit: Habit, status: HabitEntryStatus | undefined): string {
  if (status === 'done') return t.habitDone;
  if (status === 'clean') return t.quitDone;
  if (status === 'missed') return t.habitMissed;
  if (status === 'slip') return t.quitSlipped;
  return habit.kind === 'build' ? t.habitPending : t.quitPending;
}

export function ParticleTodayScreen() {
  const navigation = useNavigation();
  const now = useNow(60_000);
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { currentStreak } = useStreak();
  const { water, progress: waterProgress, add: addWater } = useWater();
  const pomodoro = useSnapshotSlice('pomodoro');
  const { habits, entries, statusOf, mark, error } = useTodayHabits();
  const { state: overviewState } = useCheckInOverview();
  const { overview: character, reload: reloadCharacter } = useCharacter();
  const [burstKey, setBurstKey] = useState(0);

  // Yakınlık check-in ve alışkanlık değişince güncellenir
  useFocusEffect(
    useCallback(() => {
      void reloadCharacter();
    }, [reloadCharacter]),
  );

  const summary = summarizeToday({
    habits,
    entries,
    completedSessions: pomodoro.completedSessions,
    sessionMinutes: pomodoro.durations.work,
    sessionsGoal: SESSIONS_BEFORE_LONG_BREAK,
  });
  const name = resolveGreetingName(user?.displayName, profile.name);
  const greeting = getGreeting(now.getHours());
  const proximity = character?.proximity == null ? null : Math.round(character.proximity);
  const scale = Math.min(width, layout.contentMaxWidth) / REFERENCE_WIDTH;

  const toggleHabit = (habit: Habit) => {
    const completed = isCompleted(statusOf(habit.id));
    if (!completed) {
      hapticLight();
      setBurstKey((key) => key + 1);
    }
    void mark(habit, completed ? undefined : doneStatusFor(habit));
  };

  return (
    <Screen contentStyle={styles.content}>
      {/* Halka ekranın üst bölümünü kaplar; başlık satırı üstüne biner */}
      <View style={[styles.ringArea, { height: RING_VISIBLE_HEIGHT * scale }]}>
        <ParticleRing
          progress={summary.habitPct / 100}
          burstKey={burstKey}
          accessibilityLabel={t.ringA11y(summary.habitPct, summary.focusPct)}
        >
          <AppText variant="ringValue">%{summary.habitPct}</AppText>
          <AppText variant="particleCaption">{p.ringCaption}</AppText>
          <AppText variant="muted" style={styles.ringSub}>
            {p.habitCount(summary.done, summary.total)}
          </AppText>
        </ParticleRing>

        <Appear style={styles.header}>
          <View style={styles.headerText}>
            <AppText variant="small">{formatWeekdayDayMonth(now)}</AppText>
            <AppText variant="screenTitle" accessibilityRole="header" numberOfLines={1}>
              {name ? t.greeting(greeting, name) : greeting}
            </AppText>
          </View>
          <View style={styles.headerActions}>
            <ThemeToggleButton variant="glass" />
            <IconButton
              icon="settings"
              variant="glass"
              size={44}
              accessibilityLabel={t.settings}
              onPress={() => navigation.navigate('Settings')}
            />
          </View>
        </Appear>
      </View>

      {/* Üç cam kart: odak süresi, yakınlık, seri */}
      <Appear delay={staggers.summary} style={styles.stats}>
        <GlassCard style={styles.stat}>
          <AppText variant="stat">{t.minutes(summary.focusMinutes)}</AppText>
          <AppText variant="dim">{p.focusStat}</AppText>
        </GlassCard>
        <GlassCard style={styles.stat}>
          <AppText variant="stat">{proximity === null ? '—' : `%${proximity}`}</AppText>
          <AppText variant="dim">{p.proximityStat}</AppText>
        </GlassCard>
        <GlassCard style={styles.stat}>
          <AppText variant="stat" style={{ color: colors.gold }}>
            {p.streakValue(currentStreak)}
          </AppText>
          <AppText variant="dim">{p.streakStat}</AppText>
        </GlassCard>
      </Appear>

      {/* Sıradakiler */}
      <Appear delay={staggers.list} style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="section" accessibilityRole="header">
            {p.upNext}
          </AppText>
          <ScalePressable
            onPress={() => navigation.navigate('Habits')}
            accessibilityRole="link"
            accessibilityLabel={`${p.upNext}: ${t.seeAll}`}
            hitSlop={12}
          >
            <AppText variant="label" style={styles.link}>
              {t.seeAll}
            </AppText>
          </ScalePressable>
        </View>

        {habits.map((habit, index) => {
          const status = statusOf(habit.id);
          const done = isCompleted(status);
          const color = DOT_COLORS[index % DOT_COLORS.length] ?? colors.amber;
          // Sağa kaydırmak da butonla aynı işi yapar
          return (
            <SwipeToComplete
              key={habit.id}
              done={done}
              color={color}
              label={done ? t.swipeUndo : t.swipeDone}
              onComplete={() => toggleHabit(habit)}
            >
              <GlassHabitRow
                title={habit.title}
                subtitle={habitSubtitle(habit, status)}
                color={color}
                done={done}
                actionLabel={done ? t.unmark(habit.title) : t.markDone(habit.title)}
                onAction={() => toggleHabit(habit)}
              />
            </SwipeToComplete>
          );
        })}

        <GlassHabitRow
          title={t.waterTitle((water.target / 1000).toLocaleString('tr-TR'))}
          subtitle={p.water(water.current, water.target)}
          color={colors.sapphire}
          done={waterProgress.pct >= 100}
          actionIcon="plus"
          actionLabel={t.waterAdd(WATER_STEP_ML)}
          onAction={() => {
            hapticLight();
            void addWater(WATER_STEP_ML);
          }}
        />

        {habits.length === 0 ? (
          <GlassCard style={styles.empty}>
            <AppText variant="muted">{t.noHabits}</AppText>
            <ScalePressable
              onPress={() => navigation.navigate('Habits')}
              accessibilityRole="link"
              hitSlop={12}
            >
              <AppText variant="label" style={styles.link}>
                {t.addHabit}
              </AppText>
            </ScalePressable>
          </GlassCard>
        ) : null}

        {error ? (
          <AppText variant="muted" style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </AppText>
        ) : null}
      </Appear>

      <Appear delay={staggers.button} style={styles.section}>
        <PillButton
          label={t.startFocus}
          icon="play"
          shape="pill"
          color={colors.textPrimary}
          onPress={() => navigation.navigate('Main', { screen: 'Focus' })}
        />
        {overviewState.kind === 'ready' ? (
          <CheckInCard
            overview={overviewState.overview}
            onOpen={(date) => navigation.navigate('CheckIn', { date })}
            onHistory={() => navigation.navigate('History')}
          />
        ) : null}
      </Appear>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingTop: 0 },
  // Halka kutusu tam genişlikte: ekran kenar boşluğu geri alınır
  ringArea: {
    marginHorizontal: -layout.screenPadding,
    overflow: 'hidden',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: spacing.md,
    left: layout.screenPadding,
    right: layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: { flex: 1, gap: spacing.xxs },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ringSub: { marginTop: spacing.xs },
  stats: { flexDirection: 'row', gap: spacing.smd, marginTop: -spacing.xxl },
  stat: { flex: 1, alignItems: 'center', gap: spacing.xxs },
  section: { gap: spacing.smd },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  link: { color: colors.textPrimary, textDecorationLine: 'underline' },
  empty: { gap: spacing.sm },
  error: { color: colors.danger },
});
