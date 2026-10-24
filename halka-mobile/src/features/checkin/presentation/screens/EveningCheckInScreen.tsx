// Akşam check-in: alışkanlık cevapları + günün puanı + (isteğe bağlı) gün notu.
// Gün için kayıt varsa düzenleme modunda açılır.
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, spacing } from '@core/theme/tokens';
import { formatDayMonth } from '@core/utils/date';
import { BalanceBadge } from '@features/checkin/presentation/components/BalanceBadge';
import { HabitAnswerRow } from '@features/checkin/presentation/components/HabitAnswerRow';
import { RatingPicker } from '@features/checkin/presentation/components/RatingPicker';
import { themedStyles } from '@core/theme/themed';
import { useCheckInSession } from '@features/checkin/presentation/useCheckInSession';
import { DayNoteField } from '@features/history/presentation/components/DayNoteField';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { Chip } from '@presentation/components/common/Chip';
import { Card } from '@presentation/components/common/Card';
import { Screen } from '@presentation/components/common/Screen';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';
import { SectionTitle } from '@presentation/components/common/SectionTitle';
import type { RootStackScreenProps } from '@presentation/navigation/types';

const t = strings.checkIn;

export function EveningCheckInScreen({ route, navigation }: RootStackScreenProps<'CheckIn'>) {
  const { date } = route.params;
  const vm = useCheckInSession(date);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const build = vm.habits.filter((habit) => habit.kind === 'build');
  const quit = vm.habits.filter((habit) => habit.kind === 'quit');
  const session = vm.state.kind === 'ready' ? vm.state.session : null;
  const isEdit = session?.existing != null;
  // Hatalı gün görünüyorsa ya da zaten not varsa not alanı açık gelir
  const showNote = noteOpen || vm.preview.troubled || vm.note.length > 0;

  const submit = async () => {
    if (vm.rating === null) {
      setSubmitError(t.ratingRequired);
      return;
    }
    const error = await vm.save();
    setSubmitError(error);
    if (!error) navigation.goBack();
  };

  return (
    <Screen
      modal
      keyboard
      header={
        <ScreenHeader
          title={t.title}
          subtitle={`${session?.day === 'yesterday' ? t.yesterdayLabel : t.todayLabel} · ${formatDayMonth(date)}`}
          onClose={() => navigation.goBack()}
          bordered
        />
      }
    >
      {vm.state.kind === 'loading' ? <ActivityIndicator color={colors.textMuted} /> : null}

      {vm.state.kind === 'error' ? (
        <View style={styles.center}>
          <AppText variant="muted" style={styles.error}>
            {vm.state.message}
          </AppText>
          <ActionButton label={strings.common.retry} onPress={vm.reload} />
        </View>
      ) : null}

      {session ? (
        <>
          {isEdit ? <AppText variant="muted">{t.editMode}</AppText> : null}

          {vm.habits.length === 0 ? (
            <Card>
              <AppText variant="muted">{t.noHabits}</AppText>
              <Chip label={t.addHabits} onPress={() => navigation.navigate('Habits')} />
            </Card>
          ) : null}

          {build.length > 0 ? (
            <Card>
              <SectionTitle title={t.buildQuestion} icon="trending-up" />
              {build.map((habit) => (
                <HabitAnswerRow
                  key={habit.id}
                  habit={habit}
                  value={vm.answers[habit.id]}
                  onChange={(status) => vm.setAnswer(habit.id, status)}
                />
              ))}
            </Card>
          ) : null}

          {quit.length > 0 ? (
            <Card>
              <SectionTitle title={t.quitQuestion} icon="shield" />
              {quit.map((habit) => (
                <HabitAnswerRow
                  key={habit.id}
                  habit={habit}
                  value={vm.answers[habit.id]}
                  onChange={(status) => vm.setAnswer(habit.id, status)}
                />
              ))}
              <AppText variant="dim">{t.unansweredHint}</AppText>
            </Card>
          ) : null}

          <Card>
            <SectionTitle title={t.ratingQuestion} icon="star" />
            <RatingPicker value={vm.rating} onChange={vm.setRating} />
          </Card>

          {vm.preview.balance ? <BalanceBadge score={vm.preview.balance.score} /> : null}

          <Card>
            {vm.preview.troubled ? <AppText variant="muted">{t.troubledInvite}</AppText> : null}
            {showNote ? (
              <DayNoteField value={vm.note} onChange={vm.setNote} label={t.noteLabel} />
            ) : (
              <Chip label={t.noteLabel} icon="plus" onPress={() => setNoteOpen(true)} />
            )}
          </Card>

          {submitError ? (
            <AppText variant="muted" style={styles.error} accessibilityLiveRegion="assertive">
              {submitError}
            </AppText>
          ) : null}

          <ActionButton
            label={isEdit ? t.update : t.save}
            variant="solid"
            disabled={vm.saving}
            onPress={() => void submit()}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = themedStyles(() => ({
  center: { alignItems: 'center', gap: spacing.md },
  error: { color: colors.danger, textAlign: 'center' },
}));
