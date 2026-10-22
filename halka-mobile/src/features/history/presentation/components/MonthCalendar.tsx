// Aylık takvim: her günde denge skoru, zor gün işareti ve not simgesi
import { Pressable, StyleSheet, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, fonts, fontSizes, radius, spacing } from '@core/theme/tokens';
import { WEEKDAY_SHORT_MONDAY_FIRST, formatDayMonth, parseIsoDate } from '@core/utils/date';
import type { DaySummary } from '@features/history/domain/entities';
import { AppText } from '@presentation/components/common/AppText';
import { Icon } from '@presentation/components/common/Icon';

const t = strings.history;

interface MonthCalendarProps {
  readonly days: readonly DaySummary[];
  readonly selectedDate: string;
  readonly onSelect: (date: string) => void;
}

function dayLabel(day: DaySummary): string {
  const parts = [formatDayMonth(day.date)];
  if (day.balance) parts.push(`${t.legendScore} ${day.balance.score}`);
  if (day.troubled) parts.push(t.legendTroubled);
  if (day.note) parts.push(t.legendNote);
  return parts.join(', ');
}

function DayCell({
  day,
  selected,
  onPress,
}: {
  day: DaySummary;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={day.isFuture}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: day.isFuture }}
      accessibilityLabel={dayLabel(day)}
      style={({ pressed }) => [
        styles.cell,
        !day.inMonth && styles.outside,
        day.isToday && styles.today,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <AppText style={[styles.dayNumber, day.isFuture && styles.future]}>
        {parseIsoDate(day.date).getDate()}
      </AppText>
      <AppText style={styles.score}>{day.balance ? day.balance.score : ' '}</AppText>
      <View style={styles.marks}>
        {day.troubled ? <View style={styles.troubledDot} /> : null}
        {day.note ? <Icon name="edit-2" size={10} color={colors.textMain} /> : null}
      </View>
    </Pressable>
  );
}

export function MonthCalendar({ days, selectedDate, onSelect }: MonthCalendarProps) {
  const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, index) =>
    days.slice(index * 7, index * 7 + 7),
  );

  return (
    <View style={styles.calendar}>
      <View style={styles.week}>
        {WEEKDAY_SHORT_MONDAY_FIRST.map((name) => (
          <AppText key={name} style={styles.weekday}>
            {name}
          </AppText>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={week[0]?.date} style={styles.week}>
          {week.map((day) => (
            <DayCell
              key={day.date}
              day={day}
              selected={day.date === selectedDate}
              onPress={() => onSelect(day.date)}
            />
          ))}
        </View>
      ))}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.troubledDot} />
          <AppText variant="dim">{t.legendTroubled}</AppText>
        </View>
        <View style={styles.legendItem}>
          <Icon name="edit-2" size={10} color={colors.textMain} />
          <AppText variant="dim">{t.legendNote}</AppText>
        </View>
        <View style={styles.legendItem}>
          <AppText style={styles.score}>72</AppText>
          <AppText variant="dim">{t.legendScore}</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: { gap: spacing.xs },
  week: { flexDirection: 'row', gap: spacing.xs },
  weekday: { flex: 1, textAlign: 'center', fontSize: fontSizes.xs, color: colors.textDim },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.bgCard,
  },
  outside: { opacity: 0.35 },
  today: { borderColor: colors.borderStrong },
  selected: { borderColor: colors.textMain },
  pressed: { opacity: 0.7 },
  dayNumber: { fontFamily: fonts.semibold, fontSize: fontSizes.sm },
  future: { color: colors.textDim },
  score: { fontFamily: fonts.mono, fontSize: fontSizes.xs, color: colors.textMuted },
  marks: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, minHeight: 10 },
  // Zor gün: kırmızı değil, sakin gri nokta
  troubledDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textSecondary },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
