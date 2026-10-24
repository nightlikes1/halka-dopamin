// Sade çubuk grafik: her gün için 0-100 değer; kayıt olmayan gün ince taban çizgisi.
// Ekran okuyucu için her çubuğun metin karşılığı verilir.
import { View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, fontSizes, radius, spacing } from '@core/theme/tokens';
import { formatDayMonth, formatShortDayName } from '@core/utils/date';
import type { DayValue } from '@features/character/domain/proximity';
import { AppText } from '@presentation/components/common/AppText';
import { themedStyles } from '@core/theme/themed';

interface DayBarsProps {
  readonly days: readonly DayValue[];
  readonly height?: number;
  readonly showLabels?: boolean;
}

const t = strings.character;

export function DayBars({ days, height = 72, showLabels = true }: DayBarsProps) {
  const description = days
    .map((day) =>
      t.dayValueA11y(formatDayMonth(day.date), day.value === null ? null : Math.round(day.value)),
    )
    .join(', ');

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={description}>
      <View style={[styles.bars, { height }]}>
        {days.map((day) => (
          <View key={day.date} style={styles.column}>
            {day.value === null ? (
              <View style={styles.empty} />
            ) : (
              <View style={[styles.bar, { height: Math.max(3, (day.value / 100) * height) }]} />
            )}
          </View>
        ))}
      </View>
      {showLabels ? (
        <View style={styles.labels}>
          {days.map((day) => (
            <AppText key={day.date} style={styles.label} importantForAccessibility="no">
              {formatShortDayName(day.date)}
            </AppText>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = themedStyles(() => ({
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  column: { flex: 1, justifyContent: 'flex-end', alignItems: 'stretch' },
  bar: { borderRadius: radius.sm / 2, backgroundColor: colors.accent },
  empty: { height: 2, borderRadius: 1, backgroundColor: colors.track },
  labels: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  label: { flex: 1, textAlign: 'center', fontSize: fontSizes.xs, color: colors.textDim },
}));
