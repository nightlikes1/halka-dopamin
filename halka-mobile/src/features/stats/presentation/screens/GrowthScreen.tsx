// Gelişim sekmesi: haftanın aralığı + "Gelişim", karakter kartı (yakınlık %), bu haftanın özeti
// (7 günlük halka çubukları, tamamlanan, seri, geçirilen dürtü) ve geçmiş / alışkanlık bağlantıları.
// Ayrıntılı istatistikler Faz 4'te.
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { themedStyles } from '@core/theme/themed';
import { colors, moduleColors, radius, spacing } from '@core/theme/tokens';
import { todayOf } from '@core/utils/clock';
import { addDays, formatDayRange, formatShortDayName } from '@core/utils/date';
import { useAuth } from '@features/auth/presentation/useAuth';
import { resolveLook } from '@features/character/domain/avatar';
import { moodFor } from '@features/character/domain/look';
import { diceBearSeedFor, figureFor } from '@features/character/presentation/avatarFigure';
import { AvatarBadge } from '@features/character/presentation/components/AvatarBadge';
import { useCharacter } from '@features/character/presentation/useCharacter';
import type { DatedHabitCheck } from '@features/checkin/domain/entities';
import { resolveGreetingName } from '@features/halka/domain/entities/Profile';
import { useProfile } from '@features/halka/presentation/hooks/useProfile';
import { isPendingHabit } from '@features/habits/domain/entities';
import { useHabits } from '@features/habits/presentation/useHabits';
import { WEEK_LENGTH, weekSummary } from '@features/stats/domain/weekSummary';
import { activityStreak, urgeStats } from '@features/today/domain/dayRules';
import type { UrgeLog } from '@features/today/domain/entities';
import { AppText } from '@presentation/components/common/AppText';
import { CapsuleButton } from '@presentation/components/common/CapsuleButton';
import { Icon, type IconName } from '@presentation/components/common/Icon';
import { InitialAvatar } from '@presentation/components/common/InitialAvatar';
import { Panel } from '@presentation/components/common/Panel';
import { ProgressBar } from '@presentation/components/common/ProgressBar';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { Screen } from '@presentation/components/common/Screen';
import { useDI } from '@presentation/providers/DIProvider';

const g = strings.growth;
const AVATAR = 64;
const BAR_HEIGHT = 72;
// Sıfır olmayan gün en az bu kadar dolu görünür
const MIN_BAR_PCT = 8;

export function GrowthScreen() {
  const navigation = useNavigation();
  const { today: todayCases, clock } = useDI();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { habits } = useHabits();
  const { state: characterState, reload: reloadCharacter } = useCharacter();
  const [history, setHistory] = useState<readonly DatedHabitCheck[]>([]);
  const [urges, setUrges] = useState<readonly UrgeLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      void reloadCharacter();
      void todayCases.history.execute().then((result) => {
        if (result.ok) setHistory(result.value);
      });
      void todayCases.local.execute().then((result) => {
        if (result.ok) setUrges(result.value.urges);
      });
    }, [reloadCharacter, todayCases]),
  );

  const today = todayOf(clock);
  const name = resolveGreetingName(user?.displayName, profile.name) || (user?.email ?? '');
  const activeIds = useMemo(
    () => habits.filter((habit) => !isPendingHabit(habit)).map((habit) => habit.id),
    [habits],
  );
  const week = useMemo(() => weekSummary(history, activeIds, today), [history, activeIds, today]);
  const streak = activityStreak(history, today);
  const passed = urgeStats(urges, today).passedThisWeek;
  const range = formatDayRange(addDays(today, -(WEEK_LENGTH - 1)), today);

  const overview = characterState.kind === 'ready' ? characterState.overview : null;
  const character = overview?.character ?? null;
  const proximity = overview?.proximity ?? null;
  const pct = proximity === null ? null : Math.round(proximity);

  return (
    <Screen backdrop contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <AppText variant="overline" style={styles.secondary}>
            {g.week(range)}
          </AppText>
          <AppText variant="largeTitle" accessibilityRole="header">
            {g.title}
          </AppText>
        </View>
        <ScalePressable
          onPress={() => navigation.navigate('Settings')}
          accessibilityRole="button"
          accessibilityLabel={strings.today.profileA11y(name)}
          style={styles.avatarHit}
        >
          <InitialAvatar name={name} size={36} />
        </ScalePressable>
      </View>

      <AppText variant="bodyL">{g.summary(week.averagePct)}</AppText>

      {/* Karakter */}
      {character ? (
        <ScalePressable
          onPress={() => navigation.navigate('Character')}
          accessibilityRole="button"
          accessibilityLabel={g.characterA11y(character.identity, g.proximity(pct))}
        >
          <Panel style={styles.character}>
            <AvatarBadge
              figure={figureFor(character)}
              look={resolveLook(character)}
              mood={moodFor(pct)}
              size={AVATAR}
              energy={pct === null ? null : pct / 100}
              name="growth"
              dicebear={character.dicebear}
              dicebearSeed={
                character.dicebear
                  ? diceBearSeedFor(character, character.dicebear.style)
                  : undefined
              }
            />
            <View style={styles.flexGap}>
              <AppText variant="panelTitle" numberOfLines={1}>
                {character.identity}
              </AppText>
              <ProgressBar pct={pct ?? 0} color={moduleColors.character} />
              <AppText variant="footnote" style={styles.secondary}>
                {`${g.proximity(pct)} · ${g.characterCta}`}
              </AppText>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </Panel>
        </ScalePressable>
      ) : characterState.kind === 'ready' ? (
        <Panel style={styles.gap}>
          <AppText variant="panelTitle">{g.noCharacterTitle}</AppText>
          <AppText variant="secondary" style={styles.secondary}>
            {g.noCharacterBody}
          </AppText>
          <CapsuleButton
            label={g.noCharacterCta}
            onPress={() => navigation.navigate('CharacterSetup', { mode: 'create' })}
          />
        </Panel>
      ) : null}

      {/* Bu hafta */}
      <AppText variant="sectionTitle" accessibilityRole="header" style={styles.section}>
        {g.weekTitle}
      </AppText>
      <Panel style={styles.gap}>
        <View style={styles.bars}>
          {week.days.map((day) => {
            const label = formatShortDayName(day.date);
            const height = day.pct > 0 ? Math.max(day.pct, MIN_BAR_PCT) : 0;
            return (
              <View
                key={day.date}
                style={styles.barCol}
                accessible
                accessibilityLabel={g.weekA11y(label, day.pct)}
              >
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${height}%` }]} />
                </View>
                <AppText
                  variant="footnote"
                  style={day.date === today ? styles.todayLabel : styles.secondary}
                >
                  {label}
                </AppText>
              </View>
            );
          })}
        </View>
        <View style={styles.stats}>
          <Stat value={week.completed} label={g.completed} />
          <Stat value={streak} label={g.streak} />
          <Stat value={passed} label={g.urgesPassed} />
        </View>
      </Panel>

      <Panel style={styles.links}>
        <LinkRow icon="calendar" label={g.history} onPress={() => navigation.navigate('History')} />
        <View style={styles.divider} />
        <LinkRow icon="list" label={g.habits} onPress={() => navigation.navigate('Habits')} />
      </Panel>
      <AppText variant="footnote" style={[styles.secondary, styles.soon]}>
        {g.detailsSoon}
      </AppText>
    </Screen>
  );
}

function Stat({ value, label }: { readonly value: number; readonly label: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="numeralL">{value}</AppText>
      <AppText variant="footnote" style={styles.secondary}>
        {label}
      </AppText>
    </View>
  );
}

function LinkRow({
  icon,
  label,
  onPress,
}: {
  readonly icon: IconName;
  readonly label: string;
  readonly onPress: () => void;
}) {
  return (
    <ScalePressable onPress={onPress} accessibilityRole="button" style={styles.link}>
      <Icon name={icon} size={20} color={colors.textPrimary} />
      <AppText variant="bodyL" style={styles.flex}>
        {label}
      </AppText>
      <Icon name="chevron-right" size={20} color={colors.textSecondary} />
    </ScalePressable>
  );
}

const styles = themedStyles(() => ({
  content: { paddingHorizontal: layout.edge, gap: layout.cardGap },
  flex: { flex: 1 },
  flexGap: { flex: 1, gap: spacing.xs },
  gap: { gap: spacing.md },
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
  character: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  section: { marginTop: spacing.lg, marginBottom: layout.sectionToCard },
  bars: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  barCol: { flex: 1, alignItems: 'center', gap: spacing.xs },
  barTrack: {
    width: '100%',
    maxWidth: 28,
    height: BAR_HEIGHT,
    borderRadius: radius.sm,
    backgroundColor: colors.track,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: radius.sm, backgroundColor: colors.gold },
  todayLabel: { color: colors.textPrimary },
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1 },
  links: { paddingVertical: spacing.xs },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.touchTarget + spacing.sm,
  },
  divider: { height: 1, backgroundColor: colors.border },
  soon: { textAlign: 'center', marginTop: spacing.sm },
}));
