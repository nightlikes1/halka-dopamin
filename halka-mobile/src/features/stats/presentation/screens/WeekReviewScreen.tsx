// Haftalık bakış (modal): son 7 günün halka ortalaması ve geçen haftaya göre fark, günlük çubuklar,
// en iyi gün, ortalama denge skoru, dürtü örüntüsü, dopamin dengesi ve eklenti ortalamaları.
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { themedStyles } from '@core/theme/themed';
import { colors, dopamineColors, spacing } from '@core/theme/tokens';
import { formatDayMonth, formatDayRange } from '@core/utils/date';
import {
  BalanceCard,
  PatternCard,
  WeekBars,
} from '@features/stats/presentation/components/InsightCards';
import { useInsights } from '@features/stats/presentation/useInsights';
import { AppText } from '@presentation/components/common/AppText';
import { CapsuleButton } from '@presentation/components/common/CapsuleButton';
import { Panel } from '@presentation/components/common/Panel';
import { Screen } from '@presentation/components/common/Screen';
import { ScreenHeader } from '@presentation/components/common/ScreenHeader';

const w = strings.weekReview;

export function WeekReviewScreen() {
  const navigation = useNavigation();
  const { insights, error } = useInsights();
  const close = () => navigation.goBack();

  return (
    <Screen
      modal
      backdrop
      contentStyle={styles.content}
      header={<ScreenHeader title={w.title} onClose={close} />}
    >
      {error ? (
        <AppText variant="secondary" style={styles.error}>
          {error}
        </AppText>
      ) : null}
      {!insights ? (
        error ? null : (
          <ActivityIndicator color={colors.textSecondary} />
        )
      ) : (
        <>
          <AppText variant="overline" style={styles.secondary}>
            {formatDayRange(insights.week.from, insights.week.to)}
          </AppText>
          <View style={styles.hero}>
            <AppText variant="numeralXL">{`%${insights.week.averagePct}`}</AppText>
            <View>
              <AppText variant="secondary" style={styles.secondary}>
                {w.average}
              </AppText>
              <AppText
                variant="bodyStrong"
                style={{
                  color: insights.week.delta > 0 ? dopamineColors.quality : colors.textSecondary,
                }}
              >
                {w.delta(insights.week.delta)}
              </AppText>
            </View>
          </View>

          <Panel>
            <WeekBars days={insights.week.days} today={insights.today} a11y={w.dayA11y} />
          </Panel>

          <Panel style={styles.gap}>
            <AppText variant="bodyStrong">{w.bestTitle}</AppText>
            {insights.week.bestDay ? (
              <>
                <AppText variant="bodyL">
                  {w.bestBody(
                    formatDayMonth(insights.week.bestDay.date),
                    insights.week.bestDay.pct,
                  )}
                </AppText>
                {insights.week.bestDay.score !== null ? (
                  <AppText variant="footnote" style={styles.secondary}>
                    {w.bestScore(insights.week.bestDay.score)}
                  </AppText>
                ) : null}
              </>
            ) : (
              <AppText variant="secondary" style={styles.secondary}>
                {w.bestEmpty}
              </AppText>
            )}
          </Panel>

          {insights.week.averageScore !== null ? (
            <Panel style={styles.scoreRow}>
              <AppText variant="bodyStrong" style={styles.flex}>
                {w.scoreTitle}
              </AppText>
              <AppText variant="numeralL">{insights.week.averageScore}</AppText>
            </Panel>
          ) : null}

          <PatternCard pattern={insights.weekPattern} />
          <BalanceCard balance={insights.balance} />

          <Panel style={styles.gap}>
            <AppText variant="bodyStrong">{w.logsTitle}</AppText>
            <AppText variant="secondary">{w.waterAvg(insights.logs.waterPct)}</AppText>
            <AppText variant="secondary">{w.focusAvg(insights.logs.focusSessions)}</AppText>
          </Panel>

          <CapsuleButton label={w.finish} onPress={close} />
        </>
      )}
    </Screen>
  );
}

const styles = themedStyles(() => ({
  content: { paddingHorizontal: layout.edge, gap: layout.cardGap },
  flex: { flex: 1 },
  gap: { gap: spacing.sm },
  secondary: { color: colors.textSecondary },
  error: { color: colors.danger },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  scoreRow: { flexDirection: 'row', alignItems: 'center' },
}));
