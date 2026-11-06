// "Alışkanlıklarım": yapmak ve azaltmak istediklerin. Satıra dokununca aynı pencere düzenleme için açılır (HabitSheet)
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { colors, dopamineColors, radius, spacing } from '@core/theme/tokens';
import { isPendingHabit, type Habit, type HabitKind } from '@features/habits/domain/entities';
import { themedStyles } from '@core/theme/themed';
import { HabitSheet } from '@features/habits/presentation/components/HabitSheet';
import { useHabits } from '@features/habits/presentation/useHabits';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { Card } from '@presentation/components/common/Card';
import { Icon } from '@presentation/components/common/Icon';
import { PillButton } from '@presentation/components/common/PillButton';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { Screen } from '@presentation/components/common/Screen';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';
import { SectionTitle } from '@presentation/components/common/SectionTitle';
import type { RootStackScreenProps } from '@presentation/navigation/types';

const t = strings.habits;

interface HabitSectionProps {
  readonly kind: HabitKind;
  readonly habits: readonly Habit[];
  readonly onEdit: (habit: Habit) => void;
}

function HabitSection({ kind, habits, onEdit }: HabitSectionProps) {
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
      {habits.map((habit) => {
        const pending = isPendingHabit(habit);
        return (
          <ScalePressable
            key={habit.id}
            disabled={pending}
            onPress={() => onEdit(habit)}
            accessibilityLabel={pending ? `${habit.title}: ${t.adding}` : t.editRow(habit.title)}
            style={[styles.row, { borderLeftColor: tint }]}
          >
            <AppText style={styles.rowTitle}>{habit.title}</AppText>
            {pending ? (
              <AppText variant="dim">{t.adding}</AppText>
            ) : (
              <Icon name="edit-2" size={18} color={colors.textSecondary} />
            )}
          </ScalePressable>
        );
      })}
    </Card>
  );
}

export function HabitsScreen({ navigation }: RootStackScreenProps<'Habits'>) {
  const { allHabits: habits, status, errorMessage, reload } = useHabits();
  // null: pencere kapalı · habit null: yeni ekleme · habit dolu: düzenleme
  const [sheet, setSheet] = useState<{ readonly habit: Habit | null } | null>(null);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const edit = (habit: Habit) => setSheet({ habit });

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
      <HabitSection
        kind="build"
        habits={habits.filter((habit) => habit.kind === 'build')}
        onEdit={edit}
      />
      <HabitSection
        kind="quit"
        habits={habits.filter((habit) => habit.kind === 'quit')}
        onEdit={edit}
      />
      <PillButton label={t.addCta} icon="plus" onPress={() => setSheet({ habit: null })} />
      <HabitSheet visible={sheet !== null} habit={sheet?.habit} onClose={() => setSheet(null)} />
    </Screen>
  );
}

const styles = themedStyles(() => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.touchTarget,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderLeftWidth: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.bgCardPressed,
  },
  rowTitle: { flex: 1 },
  error: { color: colors.danger },
  errorBox: { gap: spacing.sm },
}));
