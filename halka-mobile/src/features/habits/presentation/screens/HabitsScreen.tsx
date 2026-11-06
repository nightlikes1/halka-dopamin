// "Alışkanlıklarım": yapmak ve azaltmak istediklerini gör, kaldır; ekleme tek pencereden (AddHabitSheet)
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, dopamineColors, radius, spacing } from '@core/theme/tokens';
import { isPendingHabit, type Habit, type HabitKind } from '@features/habits/domain/entities';
import { themedStyles } from '@core/theme/themed';
import { AddHabitSheet } from '@features/habits/presentation/components/AddHabitSheet';
import { useHabits } from '@features/habits/presentation/useHabits';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { Card } from '@presentation/components/common/Card';
import { IconButton } from '@presentation/components/common/IconButton';
import { PillButton } from '@presentation/components/common/PillButton';
import { Screen } from '@presentation/components/common/Screen';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';
import { SectionTitle } from '@presentation/components/common/SectionTitle';
import type { RootStackScreenProps } from '@presentation/navigation/types';
import { confirmAction } from '@presentation/utils/dialogs';

const t = strings.habits;

interface HabitSectionProps {
  readonly kind: HabitKind;
  readonly habits: readonly Habit[];
  readonly onRemove: (habit: Habit) => void;
}

function HabitSection({ kind, habits, onRemove }: HabitSectionProps) {
  const isBuild = kind === 'build';
  const tint = isBuild ? dopamineColors.quality : dopamineColors.cheap;

  return (
    <Card>
      <SectionTitle
        title={isBuild ? t.buildTitle : t.quitTitle}
        icon={isBuild ? 'trending-up' : 'shield'}
        iconColor={tint}
      />

      {habits.length === 0 ? <AppText variant="dim">{t.empty}</AppText> : null}
      {habits.map((habit) => (
        <View key={habit.id} style={[styles.row, { borderLeftColor: tint }]}>
          <AppText style={styles.rowTitle}>{habit.title}</AppText>
          {isPendingHabit(habit) ? (
            <AppText variant="dim" style={styles.pending}>
              {t.adding}
            </AppText>
          ) : (
            <IconButton
              icon="x"
              tone="danger"
              accessibilityLabel={`${habit.title} ${t.remove}`}
              onPress={() => onRemove(habit)}
              variant="ghost"
              size={44}
            />
          )}
        </View>
      ))}
    </Card>
  );
}

export function HabitsScreen({ navigation }: RootStackScreenProps<'Habits'>) {
  const { allHabits: habits, status, errorMessage, reload, archiveHabit } = useHabits();
  const [adding, setAdding] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const confirmRemove = (habit: Habit) => {
    confirmAction({
      title: t.removeTitle,
      message: t.removeBody(habit.title),
      confirmText: t.remove,
      cancelText: strings.common.cancel,
      destructive: true,
      onConfirm: () => void archiveHabit(habit.id),
    });
  };

  return (
    <Screen
      modal
      header={<ScreenHeader title={t.title} onClose={() => navigation.goBack()} bordered />}
    >
      {status === 'loading' && habits.length === 0 ? (
        <ActivityIndicator color={colors.textMuted} />
      ) : null}
      {status === 'error' ? (
        <View style={styles.errorBox}>
          <AppText variant="muted" style={styles.error}>
            {errorMessage}
          </AppText>
          <ActionButton label={strings.common.retry} onPress={() => void reload()} />
        </View>
      ) : null}
      <PillButton label={t.addCta} icon="plus" onPress={() => setAdding(true)} />
      <HabitSection
        kind="build"
        habits={habits.filter((habit) => habit.kind === 'build')}
        onRemove={confirmRemove}
      />
      <HabitSection
        kind="quit"
        habits={habits.filter((habit) => habit.kind === 'quit')}
        onRemove={confirmRemove}
      />
      <AddHabitSheet visible={adding} onClose={() => setAdding(false)} />
    </Screen>
  );
}

const styles = themedStyles(() => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    borderLeftWidth: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.bgCardPressed,
  },
  rowTitle: { flex: 1 },
  pending: { paddingRight: spacing.md, paddingVertical: spacing.md },
  error: { color: colors.danger },
  errorBox: { gap: spacing.sm },
}));
