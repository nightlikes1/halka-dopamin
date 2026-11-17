// Gelişim sekmesi: haftanın aralığı + "Gelişim", özet cümlesi, karakter kartı, günlük skor
// (check-in denge skoru + su/görev/odak/ruh hali), bu haftanın özeti, dopamin dengesi, dürtü örüntüsü,
// ruh hali ilişkisi; Haftalık bakış, Ay aynası, Geçmiş ve Alışkanlıklarım bağlantıları.
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { themedStyles } from '@core/theme/themed';
import { colors, moduleColors, spacing } from '@core/theme/tokens';
import { formatDayRange } from '@core/utils/date';
import { useAuth } from '@features/auth/presentation/useAuth';
import { resolveLook } from '@features/character/domain/avatar';
import { moodFor } from '@features/character/domain/look';
import { diceBearSeedFor, figureFor } from '@features/character/presentation/avatarFigure';
import { AvatarBadge } from '@features/character/presentation/components/AvatarBadge';
import { useCharacter } from '@features/character/presentation/useCharacter';
import { resolveGreetingName } from '@features/halka/domain/entities/Profile';
import { useProfile } from '@features/halka/presentation/hooks/useProfile';
import {
  BalanceCard,
  MoodCard,
  NavDivider,
  NavRow,
  PatternCard,
  ScoreCard,
  StatTrio,
  WeekBars,
} from '@features/stats/presentation/components/InsightCards';
import { useInsights } from '@features/stats/presentation/useInsights';
import { AppText } from '@presentation/components/common/AppText';
import { CapsuleButton } from '@presentation/components/common/CapsuleButton';
import { Icon } from '@presentation/components/common/Icon';
import { InitialAvatar } from '@presentation/components/common/InitialAvatar';
import { Panel } from '@presentation/components/common/Panel';
import { ProgressBar } from '@presentation/components/common/ProgressBar';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { Screen } from '@presentation/components/common/Screen';

const g = strings.growth;
const AVATAR = 64;

export function GrowthScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { state: characterState, reload: reloadCharacter } = useCharacter();
  const { insights, bars, error, loading } = useInsights();

  useFocusEffect(
    useCallback(() => {
      void reloadCharacter();
    }, [reloadCharacter]),
  );

  const name = resolveGreetingName(user?.displayName, profile.name) || (user?.email ?? '');
  const overview = characterState.kind === 'ready' ? characterState.overview : null;
  const character = overview?.character ?? null;
  const proximity = overview?.proximity ?? null;
  const pct = proximity === null ? null : Math.round(proximity);

  return (
    <Screen backdrop contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.flex}>
          {insights ? (
            <AppText variant="overline" style={styles.secondary}>
              {g.week(formatDayRange(insights.week.from, insights.week.to))}
            </AppText>
          ) : null}
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

      {loading ? <ActivityIndicator color={colors.textSecondary} /> : null}
      {error ? (
        <AppText variant="secondary" style={styles.error}>
          {error}
        </AppText>
      ) : null}

      {insights ? (
        <AppText variant="bodyL">
          {g.summary(insights.balance.lastingPct, insights.week.averagePct)}
        </AppText>
      ) : null}

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

      {insights ? (
        <>
          <ScoreCard score={insights.todayScore} bars={bars} />

          {/* Bu hafta */}
          <AppText variant="sectionTitle" accessibilityRole="header" style={styles.section}>
            {g.weekTitle}
          </AppText>
          <Panel style={styles.gap}>
            <WeekBars days={insights.week.days} today={insights.today} a11y={g.weekA11y} />
            <StatTrio
              items={[
                { value: insights.completed, label: g.completed },
                { value: insights.streak, label: g.streak },
                { value: insights.urgesPassed, label: g.urgesPassed },
              ]}
            />
          </Panel>
          <Panel style={styles.links}>
            <NavRow
              icon="sun"
              label={g.weekReviewRow}
              hint={g.weekReviewHint(insights.week.averagePct)}
              onPress={() => navigation.navigate('WeekReview')}
            />
            <NavDivider />
            <NavRow
              icon="calendar"
              label={g.mirrorRow(insights.mirror.month - 1)}
              hint={g.mirrorHint}
              onPress={() => navigation.navigate('MonthMirror')}
            />
          </Panel>

          <BalanceCard balance={insights.balance} />
          <PatternCard pattern={insights.pattern} caption={g.last30} />
          <MoodCard relation={insights.mood} />
        </>
      ) : null}

      <Panel style={styles.links}>
        <NavRow icon="clock" label={g.history} onPress={() => navigation.navigate('History')} />
        <NavDivider />
        <NavRow icon="list" label={g.habits} onPress={() => navigation.navigate('Habits')} />
      </Panel>
    </Screen>
  );
}

const styles = themedStyles(() => ({
  content: { paddingHorizontal: layout.edge, gap: layout.cardGap },
  flex: { flex: 1 },
  flexGap: { flex: 1, gap: spacing.xs },
  gap: { gap: spacing.md },
  secondary: { color: colors.textSecondary },
  error: { color: colors.danger },
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
  links: { paddingVertical: spacing.xs },
}));
