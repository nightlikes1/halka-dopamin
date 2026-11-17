// Bugün sekmesi (yeni düzen): tarih + "Bugün", Canım çekiyor ve profil; canlı halka kartı (yüzde,
// seri, Çember); alışkanlık listesi (bekleyenler, sonra "Tamamlandı"); 19:00 sonrası akşam kapanışı.
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { themedStyles } from '@core/theme/themed';
import { accentAt, accentColors, colors, moduleColors, spacing } from '@core/theme/tokens';
import { formatWeekdayDayMonth } from '@core/utils/date';
import { useAuth } from '@features/auth/presentation/useAuth';
import { CheckInCard } from '@features/checkin/presentation/components/CheckInCard';
import { useCheckInOverview } from '@features/checkin/presentation/useCheckInOverview';
import { resolveGreetingName } from '@features/halka/domain/entities/Profile';
import { useProfile } from '@features/halka/presentation/hooks/useProfile';
import type { CreateHabitInput, Habit } from '@features/habits/domain/entities';
import { HabitSheet } from '@features/habits/presentation/components/HabitSheet';
import { isCompleted, isEveningOpen } from '@features/today/domain/dayRules';
import { CircleStrip } from '@features/today/presentation/components/CircleStrip';
import { DayCompleteModal } from '@features/today/presentation/components/DayCompleteModal';
import { LiveRing } from '@presentation/components/common/LiveRing';
import { TodayHabitRow } from '@features/today/presentation/components/TodayHabitRow';
import { useToday } from '@features/today/presentation/useToday';
import { ActionSheet, type ActionSheetOption } from '@presentation/components/common/ActionSheet';
import { AppText } from '@presentation/components/common/AppText';
import { CapsuleButton } from '@presentation/components/common/CapsuleButton';
import { Icon } from '@presentation/components/common/Icon';
import { InitialAvatar } from '@presentation/components/common/InitialAvatar';
import { Panel } from '@presentation/components/common/Panel';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { Screen } from '@presentation/components/common/Screen';
import { UndoToast } from '@presentation/components/common/UndoToast';
import { useNow } from '@presentation/hooks/useNow';
import { useTabBarClearance } from '@presentation/navigation/GlassTabBar';
import { useParticleStyle } from '@presentation/store/usePreferencesStore';

const t = strings.today;
const RING_SIZE = 132;

export function TodayScreen() {
  const navigation = useNavigation();
  const now = useNow(60_000);
  const particles = useParticleStyle();
  const clearance = useTabBarClearance();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { state: overview } = useCheckInOverview();
  const vm = useToday();
  const [sheet, setSheet] = useState<{
    habit: Habit | null;
    initial: CreateHabitInput | null;
  } | null>(null);
  const [menuFor, setMenuFor] = useState<Habit | null>(null);
  const [suggestion, setSuggestion] = useState(0);

  const name = resolveGreetingName(user?.displayName, profile.name) || (user?.email ?? '');
  const accentOf = (habit: Habit) => accentColors[accentAt(Math.max(0, vm.habits.indexOf(habit)))];
  const open = vm.habits.filter((habit) => !isCompleted(vm.statusOf(habit.id)));
  const done = vm.habits.filter((habit) => isCompleted(vm.statusOf(habit.id)));
  const { progress } = vm;

  const renderRow = (habit: Habit) => (
    <TodayHabitRow
      key={habit.id}
      habit={habit}
      status={vm.statusOf(habit.id)}
      mini={vm.minis.has(habit.id)}
      nights={habit.kind === 'quit' ? vm.cleanNights(habit.id) : 0}
      accent={accentOf(habit)}
      onToggle={() => vm.toggle(habit)}
      onMenu={() => setMenuFor(habit)}
    />
  );

  const menuOptions = (habit: Habit): ActionSheetOption[] => {
    const close = (action: () => void) => () => {
      setMenuFor(null);
      action();
    };
    const options: ActionSheetOption[] = [];
    if (habit.kind === 'build') {
      const mini = vm.minis.has(habit.id);
      options.push({
        key: 'mini',
        label: mini ? t.menuMiniUndo : t.menuMini,
        icon: 'feather',
        onPress: close(() => vm.toggleMini(habit)),
      });
    }
    options.push(
      {
        key: 'edit',
        label: t.menuEdit,
        icon: 'edit-2',
        onPress: close(() => setSheet({ habit, initial: null })),
      },
      {
        key: 'archive',
        label: t.menuArchive,
        icon: 'archive',
        destructive: true,
        onPress: close(() => vm.archive(habit)),
      },
    );
    return options;
  };

  const suggest = () => {
    const list = t.suggestions;
    const item = list[suggestion % list.length];
    setSuggestion((index) => index + 1);
    if (item) setSheet({ habit: null, initial: { kind: item.kind, title: item.title } });
  };

  const toastBottom = particles ? clearance : spacing.lg;

  return (
    <Screen
      backdrop
      contentStyle={styles.content}
      overlay={
        vm.undo.current ? (
          <UndoToast
            message={vm.undo.current.message}
            undoLabel={t.undo}
            onUndo={vm.undo.undo}
            bottom={toastBottom}
          />
        ) : null
      }
    >
      {/* Üst kısım */}
      <View style={styles.header}>
        <View style={styles.flex}>
          <AppText variant="overline" style={styles.secondary}>
            {formatWeekdayDayMonth(now)}
          </AppText>
          <AppText variant="largeTitle" accessibilityRole="header">
            {t.title}
          </AppText>
        </View>
        <CapsuleButton
          label={t.urgeButton}
          variant="secondary"
          icon="wind"
          accessibilityLabel={t.urgeA11y}
          onPress={() => navigation.navigate('Urge')}
        />
        <ScalePressable
          onPress={() => navigation.navigate('Settings')}
          accessibilityRole="button"
          accessibilityLabel={t.profileA11y(name)}
          style={styles.avatarHit}
        >
          <InitialAvatar name={name} size={36} />
        </ScalePressable>
      </View>

      {/* Canlı halka */}
      <Panel style={styles.ringCard}>
        <LiveRing
          size={RING_SIZE}
          progress={progress.total > 0 ? progress.done / progress.total : 0}
          mood={vm.mood}
          accessibilityLabel={t.ringA11y(progress.pct, progress.done, progress.total)}
        >
          <AppText variant="numeralL">{t.ringPct(progress.pct)}</AppText>
        </LiveRing>
        <View style={styles.ringInfo}>
          <AppText variant="panelTitle">{t.ringCount(progress.done, progress.total)}</AppText>
          <View style={styles.moodLine}>
            <View
              style={[
                styles.moodDot,
                {
                  backgroundColor: vm.mood === 'lively' ? moduleColors.energy : moduleColors.breath,
                },
              ]}
            />
            <AppText variant="footnote" style={styles.secondary}>
              {progress.done === 0
                ? t.notStarted
                : vm.mood === 'lively'
                  ? t.moodLively
                  : t.moodCalm}
            </AppText>
          </View>
          <View style={styles.streak} accessible accessibilityLabel={t.streakA11y(vm.streak)}>
            <Icon
              name="flame"
              size={16}
              color={vm.streak > 0 ? colors.gold : colors.textSecondary}
            />
            <AppText variant="note">{t.streak(vm.streak)}</AppText>
          </View>
          {vm.circle ? <CircleStrip circle={vm.circle} /> : null}
        </View>
      </Panel>

      {/* Alışkanlıklar */}
      <View style={styles.sectionHeader}>
        <AppText variant="sectionTitle" accessibilityRole="header" style={styles.flex}>
          {t.habitsTitle}
        </AppText>
        <ScalePressable
          onPress={() => setSheet({ habit: null, initial: null })}
          accessibilityRole="button"
          accessibilityLabel={t.addA11y}
          style={styles.linkHit}
        >
          <AppText variant="bodyStrong" style={styles.link}>
            {t.add}
          </AppText>
        </ScalePressable>
      </View>

      {vm.error ? (
        <AppText variant="secondary" style={styles.error}>
          {vm.error}
        </AppText>
      ) : null}

      {vm.isEmpty ? (
        <Panel style={styles.empty}>
          <AppText variant="panelTitle">{t.emptyTitle}</AppText>
          <AppText variant="secondary" style={styles.secondary}>
            {t.emptyBody}
          </AppText>
          <CapsuleButton
            label={t.emptyAdd}
            icon="plus"
            onPress={() => setSheet({ habit: null, initial: null })}
          />
          <CapsuleButton label={t.emptySuggest} variant="secondary" onPress={suggest} />
        </Panel>
      ) : (
        <View style={styles.list}>
          {open.map(renderRow)}
          {done.length > 0 ? (
            <>
              <AppText variant="overline" style={[styles.secondary, styles.group]}>
                {t.completedGroup(done.length)}
              </AppText>
              {done.map(renderRow)}
            </>
          ) : null}
        </View>
      )}

      {/* Akşam kapanışı */}
      {isEveningOpen(now.getHours()) ? (
        overview.kind === 'ready' ? (
          <CheckInCard
            overview={overview.overview}
            onOpen={(date) => navigation.navigate('CheckIn', { date })}
            onHistory={() => navigation.navigate('History')}
          />
        ) : null
      ) : (
        <AppText variant="footnote" style={[styles.secondary, styles.evening]}>
          {t.eveningLater}
        </AppText>
      )}

      <HabitSheet
        visible={sheet !== null}
        habit={sheet?.habit ?? null}
        initial={sheet?.initial ?? null}
        onClose={() => setSheet(null)}
      />
      <ActionSheet
        visible={menuFor !== null}
        title={menuFor?.title ?? ''}
        closeLabel={t.menuClose}
        options={menuFor ? menuOptions(menuFor) : []}
        onClose={() => setMenuFor(null)}
      />
      <DayCompleteModal visible={vm.celebrating} onClose={vm.closeCelebration} />
    </Screen>
  );
}

const styles = themedStyles(() => ({
  content: { paddingHorizontal: layout.edge, gap: layout.cardGap },
  flex: { flex: 1 },
  secondary: { color: colors.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  avatarHit: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  ringInfo: { flex: 1, gap: spacing.sm },
  moodLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  moodDot: { width: 8, height: 8, borderRadius: 4 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: layout.sectionToCard,
  },
  linkHit: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  link: { color: colors.gold },
  error: { color: colors.danger },
  list: { gap: layout.cardGap },
  group: { marginTop: spacing.md },
  empty: { gap: spacing.md },
  evening: { textAlign: 'center', marginTop: spacing.lg },
}));
