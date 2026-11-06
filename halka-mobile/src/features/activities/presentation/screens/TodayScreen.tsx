// Bugün sekmesi: selam + seri, günlük özet halkaları, alışkanlık kartları, odak seansı ve akşam check-in
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { staggers } from '@core/theme/motion';
import { accentColors, accentTints, colors, fontSizes, radius, spacing } from '@core/theme/tokens';
import { resolveGreetingName } from '@features/halka/domain/entities/Profile';
import { formatWeekdayDayMonth } from '@core/utils/date';
import { SESSIONS_BEFORE_LONG_BREAK } from '@features/halka/domain/entities/Pomodoro';
import { getGreeting } from '@features/halka/domain/services/briefingGenerator';
import { StreakPill } from '@features/activities/presentation/components/StreakPill';
import { isCompleted, summarizeToday } from '@features/activities/presentation/todaySummary';
import { themedStyles } from '@core/theme/themed';
import { useTodayHabits } from '@features/activities/presentation/useTodayHabits';
import { useAuth } from '@features/auth/presentation/useAuth';
import { CheckInCard } from '@features/checkin/presentation/components/CheckInCard';
import { useCheckInOverview } from '@features/checkin/presentation/useCheckInOverview';
import {
  isPendingHabit,
  type Habit,
  type HabitEntryStatus,
} from '@features/habits/domain/entities';
import { AddHabitSheet } from '@features/habits/presentation/components/AddHabitSheet';
import { ThemeToggleButton } from '@features/settings/presentation/components/ThemeToggleButton';
import { Appear } from '@presentation/components/common/Appear';
import { AppText } from '@presentation/components/common/AppText';
import { Chip } from '@presentation/components/common/Chip';
import { SwipeToComplete } from '@presentation/components/common/SwipeToComplete';
import { HabitCard } from '@presentation/components/common/HabitCard';
import { IconButton } from '@presentation/components/common/IconButton';
import { PillButton } from '@presentation/components/common/PillButton';
import { ProgressRing } from '@presentation/components/common/ProgressRing';
import { Screen } from '@presentation/components/common/Screen';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { useNow } from '@presentation/hooks/useNow';
import { useProfile } from '@features/halka/presentation/hooks/useProfile';
import { useStreak } from '@features/halka/presentation/hooks/useStreak';
import { useWater } from '@features/halka/presentation/hooks/useWater';
import { useSnapshotSlice } from '@features/halka/presentation/store/useHalkaStore';
import { hapticLight } from '@presentation/utils/haptics';

const t = strings.today;
const WATER_STEP_ML = 250;

// Alışkanlık kartları kehribar/ametist/yakut sırayla; safir su ve odak için ayrılmış
const HABIT_ACCENTS = ['amber', 'amethyst', 'ruby'] as const;

const doneStatusFor = (habit: Habit): HabitEntryStatus =>
  habit.kind === 'build' ? 'done' : 'clean';

function habitSubtitle(habit: Habit, status: HabitEntryStatus | undefined): string {
  if (isPendingHabit(habit)) return strings.habits.adding;
  if (status === 'done') return t.habitDone;
  if (status === 'clean') return t.quitDone;
  if (status === 'missed') return t.habitMissed;
  if (status === 'slip') return t.quitSlipped;
  return habit.kind === 'build' ? t.habitPending : t.quitPending;
}

const litres = (ml: number) => (ml / 1000).toLocaleString('tr-TR', { maximumFractionDigits: 1 });

export function TodayScreen() {
  const navigation = useNavigation();
  const now = useNow(60_000);
  const { user } = useAuth();
  const { profile } = useProfile();
  const { currentStreak } = useStreak();
  const { water, progress: waterProgress, add: addWater } = useWater();
  const pomodoro = useSnapshotSlice('pomodoro');
  const { habits, entries, statusOf, mark, error, isEmpty } = useTodayHabits();
  const { state: overviewState } = useCheckInOverview();
  const [adding, setAdding] = useState(false);

  const summary = summarizeToday({
    habits,
    entries,
    completedSessions: pomodoro.completedSessions,
    sessionMinutes: pomodoro.durations.work,
    sessionsGoal: SESSIONS_BEFORE_LONG_BREAK,
  });
  const name = resolveGreetingName(user?.displayName, profile.name);

  const toggleHabit = (habit: Habit) => {
    if (isPendingHabit(habit)) return;
    const completed = isCompleted(statusOf(habit.id));
    if (!completed) hapticLight();
    void mark(habit, completed ? undefined : doneStatusFor(habit));
  };

  return (
    <Screen contentStyle={styles.content}>
      {/* Üst satır: tarih + selam, sağda seri ve ayarlar */}
      <Appear style={styles.topRow}>
        <View style={styles.greeting}>
          <AppText variant="small">{formatWeekdayDayMonth(now)}</AppText>
          <AppText variant="greeting" accessibilityRole="header" numberOfLines={2}>
            {name ? t.greeting(getGreeting(now.getHours()), name) : getGreeting(now.getHours())}
          </AppText>
        </View>
        <View style={styles.topActions}>
          <StreakPill days={currentStreak} />
          <ThemeToggleButton variant="surface" />
          <IconButton
            icon="settings"
            variant="surface"
            size={44}
            accessibilityLabel={t.settings}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </Appear>

      {/* Günlük özet: dış halka alışkanlık, iç halka odak hedefi */}
      <Appear delay={staggers.summary} style={styles.summary}>
        <ProgressRing
          size={132}
          accessibilityLabel={t.ringA11y(summary.habitPct, summary.focusPct)}
          rings={[
            {
              progress: summary.habitPct / 100,
              color: colors.accent,
              radius: 86,
              strokeWidth: 22,
            },
            {
              progress: summary.focusPct / 100,
              color: colors.sapphire,
              radius: 56,
              strokeWidth: 16,
              delay: staggers.innerRing,
            },
          ]}
        >
          <AppText variant="stat" style={styles.ringValue}>
            %{summary.habitPct}
          </AppText>
        </ProgressRing>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <AppText variant="muted">{t.habitsMetric}</AppText>
            <AppText variant="stat">
              {summary.done} / {summary.total}
            </AppText>
          </View>
          <View style={styles.metric}>
            <AppText variant="muted">{t.focusMetric}</AppText>
            <AppText variant="stat">{t.minutes(summary.focusMinutes)}</AppText>
          </View>
        </View>
      </Appear>

      {/* Alışkanlıklarım */}
      <Appear delay={staggers.list} style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="section" accessibilityRole="header" style={styles.sectionTitle}>
            {t.habitsCardTitle}
          </AppText>
          {habits.length > 0 ? (
            <ScalePressable
              onPress={() => navigation.navigate('Habits')}
              accessibilityRole="link"
              accessibilityLabel={`${t.habitsCardTitle}: ${t.manageHabits}`}
              hitSlop={12}
            >
              <AppText variant="label" style={styles.link}>
                {t.manageHabits}
              </AppText>
            </ScalePressable>
          ) : null}
          <Chip
            label={strings.habits.add}
            icon="plus"
            variant="primary"
            accessibilityLabel={t.addHabit}
            onPress={() => setAdding(true)}
          />
        </View>

        <HabitCard
          icon="droplet"
          color={accentColors.sapphire}
          tint={accentTints.sapphire}
          title={t.waterTitle(litres(water.target))}
          progress={waterProgress.pct}
          progressDelay={staggers.waterBar}
          done={waterProgress.pct >= 100}
          actionIcon="plus"
          actionLabel={t.waterAdd(WATER_STEP_ML)}
          onAction={() => {
            hapticLight();
            void addWater(WATER_STEP_ML);
          }}
          celebrateText={t.celebrate}
        />

        {habits.map((habit, index) => {
          const status = statusOf(habit.id);
          const accent = HABIT_ACCENTS[index % HABIT_ACCENTS.length] ?? 'amber';
          const done = isCompleted(status);
          // Sağa kaydırmak da butonla aynı işi yapar
          return (
            <SwipeToComplete
              key={habit.id}
              done={done}
              color={accentColors[accent]}
              label={done ? t.swipeUndo : t.swipeDone}
              onComplete={() => toggleHabit(habit)}
              cornerRadius={radius.lg}
            >
              <HabitCard
                icon={habit.kind === 'build' ? 'trending-up' : 'shield'}
                color={accentColors[accent]}
                tint={accentTints[accent]}
                title={habit.title}
                subtitle={habitSubtitle(habit, status)}
                done={done}
                actionLabel={done ? t.unmark(habit.title) : t.markDone(habit.title)}
                onAction={() => toggleHabit(habit)}
                celebrateText={t.celebrate}
              />
            </SwipeToComplete>
          );
        })}

        {isEmpty ? (
          <View style={styles.empty}>
            <AppText variant="muted">{t.noHabits}</AppText>
          </View>
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
      <AddHabitSheet visible={adding} onClose={() => setAdding(false)} />
    </Screen>
  );
}

const styles = themedStyles(() => ({
  content: { gap: spacing.xl },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  greeting: { flex: 1, gap: spacing.xs },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lgx,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  ringValue: { fontSize: fontSizes.ringValue, lineHeight: 32 },
  metrics: { flex: 1, gap: spacing.lg },
  metric: { gap: spacing.xxs },
  section: { gap: spacing.smd },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionTitle: { flex: 1 },
  link: { color: colors.textPrimary, fontSize: fontSizes.body, textDecorationLine: 'underline' },
  empty: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  error: { color: colors.danger },
}));
