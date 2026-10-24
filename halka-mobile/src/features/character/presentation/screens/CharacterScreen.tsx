// Karakter sekmesi: profil kartı (yakınlık halkası + kimlik), özellik çubukları, rozetler, bu hafta.
// XP/seviye modeli yok: halka ve etiket yakınlığı, çubuk bu haftaki kayıtlı günleri gösterir.
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { staggers } from '@core/theme/motion';
import { accentAt, accentColors, colors, radius, spacing } from '@core/theme/tokens';
import type { CharacterOverview } from '@features/character/domain/usecases/CharacterUseCases';
import { resolveLook } from '@features/character/domain/avatar';
import { moodFor } from '@features/character/domain/look';
import {
  diceBearSeedFor,
  figureFor,
  INTRO_FIGURE,
  INTRO_LOOK,
} from '@features/character/presentation/avatarFigure';
import { computeBadges } from '@features/character/presentation/badges';
import { DayBars } from '@features/character/presentation/components/DayBars';
import { ProfileAvatar } from '@features/character/presentation/components/ProfileAvatar';
import { TraitStatRow } from '@features/character/presentation/components/TraitStatRow';
import { themedStyles } from '@core/theme/themed';
import { useCharacter } from '@features/character/presentation/useCharacter';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { Appear } from '@presentation/components/common/Appear';
import { AppText } from '@presentation/components/common/AppText';
import { Badge } from '@presentation/components/common/Badge';
import { Card } from '@presentation/components/common/Card';
import { IconButton } from '@presentation/components/common/IconButton';
import { PillButton } from '@presentation/components/common/PillButton';
import { ProgressBar } from '@presentation/components/common/ProgressBar';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { Screen } from '@presentation/components/common/Screen';
import { SectionTitle } from '@presentation/components/common/SectionTitle';
import { useStreak } from '@presentation/hooks/useStreak';
import { confirmAction, showMessage } from '@presentation/utils/dialogs';

const t = strings.character;
const WEEK_DAYS = 7;
// Özellik çubukları sırayla dolar
const TRAIT_DELAYS = [600, 750, 900, 1050, 1200];

// Düşük değerde de suçlamayan, kısa bir cümle
function supportiveMessage(proximity: number | null): string {
  if (proximity === null) return t.noData;
  if (proximity < 40) return t.supportiveLow;
  if (proximity < 75) return t.supportiveMid;
  return t.supportiveHigh;
}

function Overview({ overview }: { readonly overview: CharacterOverview }) {
  const navigation = useNavigation();
  const { remove } = useCharacter();
  const { currentStreak } = useStreak();
  const character = overview.character;
  if (!character) return null;

  const percent = overview.proximity === null ? null : Math.round(overview.proximity);
  const recordedDays = overview.week.filter((day) => day.value !== null).length;
  const hasAnyRecord =
    recordedDays > 0 ||
    overview.traits.some((summary) => summary.trend.some((day) => day.value !== null));
  const badges = computeBadges({
    hasAnyRecord,
    recordedThisWeek: recordedDays,
    streakDays: currentStreak,
    proximity: overview.proximity,
  });

  const confirmDelete = () => {
    confirmAction({
      title: t.deleteTitle,
      message: t.deleteBody,
      confirmText: t.delete,
      cancelText: strings.common.cancel,
      destructive: true,
      onConfirm: () =>
        void remove().then((error) => {
          if (error) showMessage(t.title, error);
        }),
    });
  };

  return (
    <>
      <Appear delay={staggers.summary} style={styles.profile}>
        <ProfileAvatar
          progress={(percent ?? 0) / 100}
          figure={figureFor(character)}
          look={resolveLook(character)}
          dicebear={character.dicebear}
          dicebearSeed={
            character.dicebear ? diceBearSeedFor(character, character.dicebear.style) : undefined
          }
          mood={moodFor(percent)}
          energy={percent === null ? null : percent / 100}
          onEdit={() => navigation.navigate('AvatarEditor')}
          editLabel={strings.character.studio.edit}
          pillText={t.proximityPill(percent)}
          accessibilityLabel={percent === null ? t.noData : t.proximityA11y(percent)}
        />
        <AppText variant="headline" style={styles.identity} accessibilityRole="header">
          {character.identity}
        </AppText>
        <AppText variant="muted" style={styles.center}>
          {supportiveMessage(overview.proximity)}
        </AppText>
        <View style={styles.xp}>
          <View style={styles.xpRow}>
            <AppText variant="muted">{t.weekRecorded(recordedDays)}</AppText>
            <AppText variant="muted">{t.proximityHint}</AppText>
          </View>
          <ProgressBar
            pct={(recordedDays / WEEK_DAYS) * 100}
            color={colors.accent}
            height={10}
            delay={staggers.xpBar}
            duration={900}
            shimmer
          />
        </View>
      </Appear>

      <Appear delay={staggers.list} style={styles.section}>
        <AppText variant="section" accessibilityRole="header">
          {t.traitsTitle}
        </AppText>
        {overview.traits.map((summary, index) => (
          <TraitStatRow
            key={summary.trait.id}
            name={summary.trait.name}
            percent={summary.weekAverage === null ? null : Math.round(summary.weekAverage)}
            color={accentColors[accentAt(index)]}
            delay={TRAIT_DELAYS[index] ?? TRAIT_DELAYS[TRAIT_DELAYS.length - 1] ?? 0}
            onPress={() => navigation.navigate('TraitDetail', { traitId: summary.trait.id })}
          />
        ))}
        {overview.habits.length === 0 ? (
          <ScalePressable
            onPress={() => navigation.navigate('Habits')}
            accessibilityRole="link"
            hitSlop={12}
          >
            <AppText variant="label" style={styles.link}>
              {t.addHabit}
            </AppText>
          </ScalePressable>
        ) : null}
      </Appear>

      <Appear delay={staggers.list} style={styles.section}>
        <AppText variant="section" accessibilityRole="header">
          {t.badgesTitle}
        </AppText>
        <View style={styles.badges}>
          {badges.map((badge, index) => (
            <Badge
              key={badge.id}
              icon={badge.icon}
              label={t.badges[badge.id]}
              color={colors.gold}
              tint={colors.goldMuted}
              locked={!badge.unlocked}
              delay={staggers.button + index * staggers.badgeStep}
            />
          ))}
        </View>
      </Appear>

      <Card style={styles.week}>
        <SectionTitle title={t.thisWeek} icon="bar-chart-2" />
        <DayBars days={overview.week} />
        <AppText variant="dim">{t.weekSummary(recordedDays)}</AppText>
      </Card>

      <ScalePressable
        onPress={confirmDelete}
        accessibilityLabel={t.deleteTitle}
        style={styles.delete}
      >
        <AppText variant="muted">{t.deleteTitle}</AppText>
      </ScalePressable>
    </>
  );
}

export function CharacterScreen() {
  const navigation = useNavigation();
  const { state, reload } = useCharacter();
  const hasCharacter = state.kind === 'ready' && state.overview.character !== null;

  // Check-in ya da alışkanlık değişmiş olabilir: sekmeye her dönüşte tazele
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

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
          {t.screenTitle}
        </AppText>
        {hasCharacter ? (
          <IconButton
            icon="edit-2"
            variant="surface"
            size={44}
            accessibilityLabel={t.edit}
            onPress={() => navigation.navigate('CharacterSetup', { mode: 'edit' })}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {state.kind === 'loading' ? <ActivityIndicator color={colors.textMuted} /> : null}

      {state.kind === 'error' ? (
        <Card>
          <AppText variant="muted" style={styles.error}>
            {state.message}
          </AppText>
          <ActionButton label={strings.common.retry} onPress={() => void reload()} />
        </Card>
      ) : null}

      {state.kind === 'ready' && !state.overview.character ? (
        <Appear delay={staggers.summary} style={styles.profile}>
          <ProfileAvatar
            progress={0}
            figure={INTRO_FIGURE}
            look={INTRO_LOOK}
            mood="calm"
            energy={null}
            pillText={t.proximityPill(null)}
            accessibilityLabel={t.introTitle}
          />
          <AppText variant="headline" style={styles.identity}>
            {t.introTitle}
          </AppText>
          <AppText variant="muted" style={styles.center}>
            {t.introBody}
          </AppText>
          <PillButton
            label={t.create}
            icon="plus"
            onPress={() => navigation.navigate('CharacterSetup', { mode: 'create' })}
            style={styles.create}
          />
        </Appear>
      ) : null}

      {state.kind === 'ready' && state.overview.character ? (
        <Overview overview={state.overview} />
      ) : null}
    </Screen>
  );
}

const styles = themedStyles(() => ({
  content: { gap: spacing.xl },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { flex: 1, textAlign: 'center' },
  placeholder: { width: layout.touchTarget },
  profile: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  identity: { textAlign: 'center' },
  center: { textAlign: 'center' },
  xp: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.xs },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  section: { gap: spacing.smd },
  badges: { flexDirection: 'row', gap: spacing.smd },
  week: { gap: spacing.md },
  link: { color: colors.textPrimary, textDecorationLine: 'underline' },
  delete: { alignSelf: 'center', minHeight: layout.touchTarget, justifyContent: 'center' },
  create: { alignSelf: 'stretch', marginTop: spacing.sm },
  error: { color: colors.danger },
}));
