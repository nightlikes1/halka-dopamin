// ⏱️ Pomodoro Odak
import { StyleSheet, View } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '@core/theme/tokens';
import { formatMinutesSeconds } from '@core/utils/format';
import {
  getModeDurationSeconds,
  POMODORO_MODES,
  type PomodoroMode,
} from '@domain/entities/Pomodoro';
import { getCatalogItem } from '@domain/entities/WidgetCatalog';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { Chip } from '@presentation/components/common/Chip';
import { ProgressBar } from '@presentation/components/common/ProgressBar';
import type { WidgetBodyProps } from '@presentation/components/widgets/types';
import { widgetStyles } from '@presentation/components/widgets/widgetStyles';
import { usePomodoro } from '@presentation/hooks/usePomodoro';

const ACCENT = getCatalogItem('pomodoro').accent;
const PAUSE_COLOR = colors.textMuted;

const MODE_LABELS: Record<PomodoroMode, string> = {
  work: 'Odak',
  shortBreak: 'Kısa Mola',
  longBreak: 'Uzun Mola',
};

export function PomodoroWidget({ variant }: WidgetBodyProps) {
  const { pomodoro, isRunning, remainingSeconds, toggle, reset, changeMode } = usePomodoro();
  const focused = variant === 'focused';
  const total = getModeDurationSeconds(pomodoro, pomodoro.mode);
  const elapsedPct = total > 0 ? ((total - remainingSeconds) / total) * 100 : 0;

  const modeLabel = (mode: PomodoroMode): string => {
    const minutes = pomodoro.durations[mode];
    if (focused) return `${mode === 'work' ? 'Odaklanma' : MODE_LABELS[mode]} (${minutes} dk)`;
    return mode === 'work' ? `${MODE_LABELS[mode]} (${minutes} dk)` : MODE_LABELS[mode];
  };

  const toggleLabel = isRunning
    ? focused
      ? '⏸ Durdur'
      : 'Durdur'
    : focused
      ? '▶ Başlat'
      : 'Başlat';

  return (
    <View style={focused ? widgetStyles.containerFocused : widgetStyles.container}>
      <View style={widgetStyles.wrapRow}>
        {POMODORO_MODES.map((mode) => (
          <Chip
            key={mode}
            label={modeLabel(mode)}
            variant={pomodoro.mode === mode ? 'active' : 'default'}
            accent={ACCENT}
            onPress={() => void changeMode(mode)}
          />
        ))}
      </View>

      <View style={widgetStyles.centered}>
        <AppText
          style={[styles.time, focused && styles.timeFocused]}
          accessibilityLabel={`Kalan süre ${formatMinutesSeconds(remainingSeconds)}`}
        >
          {formatMinutesSeconds(remainingSeconds)}
        </AppText>
        {focused ? (
          <AppText style={[styles.badge, { color: ACCENT }]}>
            {pomodoro.mode === 'work' ? 'Derin Odak Zamanı' : 'Zihinsel Dinlenme'}
          </AppText>
        ) : null}
        <AppText variant="muted">
          {focused ? 'Tamamlanan Seanslar: ' : 'Tamamlanan: '}
          <AppText style={styles.strong}>{pomodoro.completedSessions}</AppText>
          {focused ? ' oturum' : ' seans'}
        </AppText>
      </View>

      {focused ? <ProgressBar pct={elapsedPct} color={ACCENT} /> : null}

      <View style={styles.controls}>
        <ActionButton
          label={toggleLabel}
          color={isRunning ? PAUSE_COLOR : ACCENT}
          onPress={() => void toggle()}
          style={styles.toggle}
        />
        <Chip
          label={focused ? 'Süreyi Sıfırla' : 'Sıfırla'}
          icon="rotate-ccw"
          onPress={() => void reset()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  time: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.display,
    color: colors.textMain,
    letterSpacing: 2,
  },
  timeFocused: { fontSize: fontSizes.jumbo },
  badge: { fontFamily: fonts.semibold, fontSize: fontSizes.md, marginBottom: spacing.xs },
  strong: { fontFamily: fonts.bold, color: colors.textMain, fontSize: fontSizes.sm },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  toggle: { flex: 1 },
});
