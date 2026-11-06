// "Alışkanlıklarım": yapmak ve azaltmak istediklerin. Satıra dokununca aynı pencere düzenleme için açılır
// (HabitSheet); çöp kutusu onay sorup kaldırır
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
import { IconButton } from '@presentation/components/common/IconButton';
import { PillButton } from '@presentation/components/common/PillButton';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { Screen } from '@presentation/components/common/Screen';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';
import { SectionTitle } from '@presentation/components/common/SectionTitle';
import type { RootStackScreenProps } from '@presentation/navigation/types';
import { confirmAction } from '@presentation/utils/dialogs';

const t = strings.habits;

interface HabitSectionProps {
  readonly kind: HabitKind;
  readonly habits: readonly Habit[];
  readonly onEdit: (habit: Habit) => void;
  readonly onRemove: (habit: Habit) => void;
}

function HabitSection({ kind, habits, onEdit, onRemove }: HabitSectionProps) {
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
          {isPendingHabit(habit) ? (
            <View style={styles.rowMain}>
              <AppText style={styles.rowTitle}>{habit.title}</AppText>
              <AppText variant="dim">{t.adding}</AppText>
            </View>
          ) : (
            <>
              <ScalePressable
                onPress={() => onEdit(habit)}
                accessibilityLabel={t.editRow(habit.title)}
                containerStyle={styles.rowPress}
                style={styles.rowMain}
              >
                <AppText style={styles.rowTitle}>{habit.title}</AppText>
                <Icon name="edit-2" size={18} color={colors.textSecondary} />
              </ScalePressable>
              <IconButton
                icon="trash-2"
                tone="danger"
                variant="ghost"
                size={44}
                accessibilityLabel={`${habit.title} ${t.remove}`}
                onPress={() => onRemove(habit)}
              />
            </>
          )}
        </View>
      ))}
    </Card>
  );
}

export function HabitsScreen({ navigation }: RootStackScreenProps<'Habits'>) {
  const { allHabits: habits, status, errorMessage, reload, archiveHabit } = useHabits();
  // null: pencere kapalı · habit null: yeni ekleme · habit dolu: düzenleme
  const [sheet, setSheet] = useState<{ readonly habit: Habit | null } | null>(null);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const edit = (habit: Habit) => setSheet({ habit });

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
      <HabitSection
        kind="build"
        habits={habits.filter((habit) => habit.kind === 'build')}
        onEdit={edit}
        onRemove={confirmRemove}
      />
      <HabitSection
        kind="quit"
        habits={habits.filter((habit) => habit.kind === 'quit')}
        onEdit={edit}
        onRemove={confirmRemove}
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
    borderLeftWidth: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.bgCardPressed,
  },
  rowPress: { flex: 1 },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minHeight: layout.touchTarget,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  rowTitle: { flex: 1 },
  error: { color: colors.danger },
  errorBox: { gap: spacing.sm },
}));
