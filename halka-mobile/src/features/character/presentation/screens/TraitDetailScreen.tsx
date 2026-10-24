// Özellik detayı: bağlı alışkanlıklar ve bugünkü durumları, 7/30 günlük trend, bağlantıları düzenleme
import { useState } from 'react';
import { View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { colors, radius, spacing } from '@core/theme/tokens';
import { averageOf } from '@features/character/domain/proximity';
import { DayBars } from '@features/character/presentation/components/DayBars';
import { themedStyles } from '@core/theme/themed';
import { toDraft, useCharacter } from '@features/character/presentation/useCharacter';
import type { HabitEntryStatus } from '@features/habits/domain/entities';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { Card } from '@presentation/components/common/Card';
import { Chip } from '@presentation/components/common/Chip';
import { Screen } from '@presentation/components/common/Screen';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';
import { SectionTitle } from '@presentation/components/common/SectionTitle';
import type { RootStackScreenProps } from '@presentation/navigation/types';

const t = strings.character.detail;

function todayLabel(status: HabitEntryStatus | undefined): string {
  return status ? t.todayHabit[status] : t.todayHabit.unknown;
}

export function TraitDetailScreen({ route, navigation }: RootStackScreenProps<'TraitDetail'>) {
  const { overview, save } = useCharacter();
  const [range, setRange] = useState<7 | 30>(7);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const summary = overview?.traits.find((item) => item.trait.id === route.params.traitId);
  const character = overview?.character;

  const goBack = () => navigation.goBack();

  if (!summary || !character || !overview) {
    return (
      <Screen modal header={<ScreenHeader title="" onClose={goBack} bordered />}>
        <AppText variant="muted" style={styles.missing}>
          {t.notFound}
        </AppText>
      </Screen>
    );
  }

  const days = summary.trend.slice(-range);
  const average = averageOf(days.map((day) => day.value));
  const recorded = days.filter((day) => day.value !== null).length;

  const startEditing = () => {
    setSelected(summary.trait.habitIds);
    setEditing(true);
    setError(null);
  };

  const toggle = (habitId: string) =>
    setSelected((current) =>
      current.includes(habitId) ? current.filter((id) => id !== habitId) : [...current, habitId],
    );

  const saveLinks = async () => {
    setSaving(true);
    const draft = toDraft(character);
    const result = await save({
      ...draft,
      traits: draft.traits.map((trait) =>
        trait.id === summary.trait.id ? { ...trait, habitIds: selected } : trait,
      ),
    });
    setSaving(false);
    setError(result);
    if (!result) setEditing(false);
  };

  return (
    <Screen modal header={<ScreenHeader title={summary.trait.name} onClose={goBack} bordered />}>
      <Card>
        <View style={styles.row}>
          {([7, 30] as const).map((value) => (
            <Chip
              key={value}
              label={value === 7 ? t.last7 : t.last30}
              variant={range === value ? 'active' : 'default'}
              accent={colors.textMain}
              onPress={() => setRange(value)}
            />
          ))}
        </View>
        <DayBars days={days} showLabels={range === 7} height={range === 7 ? 72 : 56} />
        <AppText variant="muted">
          {t.trendSummary(recorded, average === null ? null : Math.round(average))}
        </AppText>
      </Card>

      <Card>
        <SectionTitle title={t.linkedHabits} icon="link-2" />

        {editing ? (
          <>
            {overview.habits.length === 0 ? (
              <AppText variant="muted">{strings.character.setup.noHabits}</AppText>
            ) : (
              <View style={styles.wrap}>
                {overview.habits.map((habit) => (
                  <Chip
                    key={habit.id}
                    label={habit.title}
                    variant={selected.includes(habit.id) ? 'active' : 'default'}
                    accent={colors.textMain}
                    onPress={() => toggle(habit.id)}
                  />
                ))}
              </View>
            )}
            {error ? (
              <AppText variant="muted" style={styles.error}>
                {error}
              </AppText>
            ) : null}
            <View style={styles.actions}>
              <Chip label={t.cancel} onPress={() => setEditing(false)} />
              <ActionButton
                label={t.saveLinks}
                variant="solid"
                disabled={saving}
                onPress={() => void saveLinks()}
              />
            </View>
          </>
        ) : (
          <>
            {summary.habits.length === 0 ? (
              <AppText variant="muted">{strings.character.habitCount(0)}</AppText>
            ) : (
              summary.habits.map((habit) => (
                <View key={habit.id} style={styles.habitRow}>
                  <AppText style={styles.flex}>{habit.title}</AppText>
                  <AppText variant="dim">{todayLabel(overview.todayStatuses[habit.id])}</AppText>
                </View>
              ))
            )}
            <View style={styles.actions}>
              {overview.habits.length === 0 ? (
                <Chip
                  label={strings.character.addHabit}
                  onPress={() => navigation.navigate('Habits')}
                />
              ) : null}
              <Chip label={t.editLinks} onPress={startEditing} />
            </View>
          </>
        )}
      </Card>
    </Screen>
  );
}

const styles = themedStyles(() => ({
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.bgCardPressed,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
  error: { color: colors.danger },
  missing: { textAlign: 'center' },
}));
