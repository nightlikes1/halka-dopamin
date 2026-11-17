// Ay aynası (modal): ayın başından bugüne geçirilen dürtüler, halkası dolan gün, en uzun seri,
// akşam kapanışı sayısı ve günlük halkalardan oluşan ay takvimi.
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { themedStyles } from '@core/theme/themed';
import { colors, spacing } from '@core/theme/tokens';
import { StatTrio } from '@features/stats/presentation/components/InsightCards';
import { useInsights } from '@features/stats/presentation/useInsights';
import { AppText } from '@presentation/components/common/AppText';
import { CapsuleButton } from '@presentation/components/common/CapsuleButton';
import { Panel } from '@presentation/components/common/Panel';
import { ProgressRing } from '@presentation/components/common/ProgressRing';
import { Screen } from '@presentation/components/common/Screen';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';

const m = strings.mirror;
const DAY_RING = 36;

export function MonthMirrorScreen() {
  const navigation = useNavigation();
  const { insights, error } = useInsights();
  const close = () => navigation.goBack();
  const mirror = insights?.mirror ?? null;
  const monthIndex = (mirror?.month ?? 1) - 1;

  return (
    <Screen
      modal
      backdrop
      contentStyle={styles.content}
      header={<ScreenHeader title={mirror ? m.title(monthIndex) : ''} onClose={close} />}
    >
      {error ? (
        <AppText variant="secondary" style={styles.error}>
          {error}
        </AppText>
      ) : null}
      {!mirror ? (
        error ? null : (
          <ActivityIndicator color={colors.textSecondary} />
        )
      ) : (
        <>
          <AppText variant="flowTitle" accessibilityRole="header">
            {m.headline(mirror.urgesPassed)}
          </AppText>

          <Panel>
            <StatTrio
              items={[
                { value: mirror.fullDays, label: m.fullDays },
                { value: mirror.bestStreak, label: m.bestStreak },
                { value: mirror.checkInDays, label: m.checkIns },
              ]}
            />
          </Panel>

          <Panel style={styles.gap}>
            <AppText variant="overline" style={styles.secondary}>
              {m.calendarTitle(monthIndex, mirror.days.length)}
            </AppText>
            <View style={styles.grid}>
              {mirror.days.map((day) => {
                const dayNumber = Number(day.date.slice(8, 10));
                return (
                  <View
                    key={day.date}
                    style={styles.cell}
                    accessible
                    accessibilityLabel={m.dayA11y(dayNumber, day.pct)}
                  >
                    <ProgressRing
                      size={DAY_RING}
                      rings={[
                        {
                          progress: day.pct / 100,
                          color: colors.gold,
                          radius: 80,
                          strokeWidth: 20,
                        },
                      ]}
                    >
                      <AppText variant="footnote" style={styles.dayNumber}>
                        {dayNumber}
                      </AppText>
                    </ProgressRing>
                  </View>
                );
              })}
            </View>
          </Panel>

          <CapsuleButton label={m.continue(monthIndex)} onPress={close} />
        </>
      )}
    </Screen>
  );
}

const styles = themedStyles(() => ({
  content: { paddingHorizontal: layout.edge, gap: layout.cardGap },
  gap: { gap: spacing.md },
  secondary: { color: colors.textSecondary },
  error: { color: colors.danger },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: { width: DAY_RING, alignItems: 'center' },
  dayNumber: { color: colors.textSecondary },
}));
