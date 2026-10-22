// Geçmiş: aylık takvim + seçili günün check-in özeti ve notu
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, spacing } from '@core/theme/tokens';
import { formatMonthYear } from '@core/utils/date';
import { resolveCheckInDay } from '@features/checkin/domain/rules';
import { DayDetail } from '@features/history/presentation/components/DayDetail';
import { MonthCalendar } from '@features/history/presentation/components/MonthCalendar';
import { useMonthHistory } from '@features/history/presentation/useMonthHistory';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { IconButton } from '@presentation/components/common/IconButton';
import { Screen } from '@presentation/components/common/Screen';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';
import type { RootStackScreenProps } from '@presentation/navigation/types';

const t = strings.history;

export function HistoryScreen({ route, navigation }: RootStackScreenProps<'History'>) {
  const vm = useMonthHistory(route.params?.date);
  const today = vm.state.kind === 'ready' ? vm.state.data.today : null;

  return (
    <Screen
      modal
      keyboard
      header={<ScreenHeader title={t.title} onClose={() => navigation.goBack()} bordered />}
    >
      <View style={styles.monthBar}>
        <IconButton
          icon="chevron-left"
          accessibilityLabel={t.previousMonth}
          onPress={() => vm.goToMonth(-1)}
          size={44}
        />
        <AppText variant="subtitle">{formatMonthYear(vm.month.year, vm.month.month)}</AppText>
        <IconButton
          icon="chevron-right"
          accessibilityLabel={t.nextMonth}
          onPress={() => vm.goToMonth(1)}
          size={44}
        />
      </View>

      {vm.state.kind === 'loading' ? <ActivityIndicator color={colors.textMuted} /> : null}

      {vm.state.kind === 'error' ? (
        <View style={styles.errorBox}>
          <AppText variant="muted" style={styles.error}>
            {vm.state.message}
          </AppText>
          <ActionButton label={strings.common.retry} onPress={() => void vm.reload()} />
        </View>
      ) : null}

      {vm.state.kind === 'ready' ? (
        <MonthCalendar
          days={vm.state.data.days}
          selectedDate={vm.selectedDate}
          onSelect={vm.selectDate}
        />
      ) : null}

      {vm.selectedDay && today ? (
        <DayDetail
          key={`${vm.selectedDay.date}|${vm.selectedDay.note?.updatedAt ?? ''}`}
          day={vm.selectedDay}
          canCheckIn={resolveCheckInDay(vm.selectedDay.date, today) !== null}
          onOpenCheckIn={() => navigation.navigate('CheckIn', { date: vm.selectedDate })}
          onSaveNote={(text) => vm.saveNote(vm.selectedDate, text)}
          onDeleteNote={() => vm.deleteNote(vm.selectedDate)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  monthBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  errorBox: { gap: spacing.sm, alignItems: 'center' },
  error: { color: colors.danger, textAlign: 'center' },
});
