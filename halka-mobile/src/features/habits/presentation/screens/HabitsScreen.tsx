// "Alışkanlıklarım": yapmak ve azaltmak istediklerini ekle/kaldır
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, dopamineColors, radius, spacing } from '@core/theme/tokens';
import {
  HABIT_TITLE_MAX_LENGTH,
  sameHabitTitle,
  type Habit,
  type HabitKind,
} from '@features/habits/domain/entities';
import { themedStyles } from '@core/theme/themed';
import { useHabits } from '@features/habits/presentation/useHabits';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { AppTextInput } from '@presentation/components/common/AppTextInput';
import { Card } from '@presentation/components/common/Card';
import { Chip } from '@presentation/components/common/Chip';
import { IconButton } from '@presentation/components/common/IconButton';
import { Screen } from '@presentation/components/common/Screen';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';
import { SectionTitle } from '@presentation/components/common/SectionTitle';
import type { RootStackScreenProps } from '@presentation/navigation/types';
import { confirmAction } from '@presentation/utils/dialogs';

const t = strings.habits;

interface HabitSectionProps {
  readonly kind: HabitKind;
  readonly habits: readonly Habit[];
  readonly onAdd: (kind: HabitKind, title: string) => Promise<boolean>;
  readonly onRemove: (habit: Habit) => void;
  // Tüm aktif alışkanlıklar (iki bölüm birlikte): aynı ad kontrolü
  readonly allHabits: readonly Habit[];
}

function HabitSection({ kind, habits, onAdd, onRemove, allHabits }: HabitSectionProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const isBuild = kind === 'build';
  const tint = isBuild ? dopamineColors.quality : dopamineColors.cheap;

  const submit = async () => {
    const trimmed = title.trim();
    if (trimmed.length === 0) return setError(t.titleRequired);
    if (trimmed.length > HABIT_TITLE_MAX_LENGTH) return setError(t.titleTooLong);
    if (allHabits.some((habit) => sameHabitTitle(habit.title, trimmed))) {
      return setError(t.titleDuplicate);
    }
    setError(null);
    if (await onAdd(kind, trimmed)) setTitle('');
  };

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
          <IconButton
            icon="x"
            tone="danger"
            accessibilityLabel={`${habit.title} ${t.remove}`}
            onPress={() => onRemove(habit)}
            variant="ghost"
            size={44}
          />
        </View>
      ))}

      <View style={styles.addRow}>
        <AppTextInput
          value={title}
          onChangeText={setTitle}
          placeholder={isBuild ? t.buildPlaceholder : t.quitPlaceholder}
          maxLength={HABIT_TITLE_MAX_LENGTH}
          returnKeyType="done"
          onSubmitEditing={() => void submit()}
          style={styles.input}
          accessibilityLabel={isBuild ? t.buildTitle : t.quitTitle}
        />
        <Chip label={t.add} icon="plus" variant="primary" onPress={() => void submit()} />
      </View>
      {error ? (
        <AppText variant="muted" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </Card>
  );
}

export function HabitsScreen({ navigation }: RootStackScreenProps<'Habits'>) {
  const { habits, status, errorMessage, reload, createHabit, archiveHabit } = useHabits();

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

  const add = (kind: HabitKind, title: string) => createHabit({ kind, title });

  return (
    <Screen
      modal
      keyboard
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
        onAdd={add}
        allHabits={habits}
        onRemove={confirmRemove}
      />
      <HabitSection
        kind="quit"
        habits={habits.filter((habit) => habit.kind === 'quit')}
        onAdd={add}
        allHabits={habits}
        onRemove={confirmRemove}
      />
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
  addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  input: { flex: 1 },
  error: { color: colors.danger },
  errorBox: { gap: spacing.sm },
}));
