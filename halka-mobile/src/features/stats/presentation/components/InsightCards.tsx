// Gelişim kartları: günlük skor + çubuklar, dopamin dengesi, dürtü örüntüsü, ruh hali ilişkisi,
// 7 günlük çubuklar, üçlü sayı satırı ve bağlantı satırı. Gelişim ve Haftalık bakış ortak kullanır.
import { View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { themedStyles } from '@core/theme/themed';
import { colors, dopamineColors, moduleColors, radius, spacing } from '@core/theme/tokens';
import { formatShortDayName } from '@core/utils/date';
import {
  URGE_SLOTS,
  moodInsight,
  type DopamineBalance,
  type MoodRelation,
  type TodayBars,
  type UrgePattern,
} from '@features/stats/domain/insights';
import { AppText } from '@presentation/components/common/AppText';
import { Icon, type IconName } from '@presentation/components/common/Icon';
import { LiveRing } from '@presentation/components/common/LiveRing';
import { Panel } from '@presentation/components/common/Panel';
import { ProgressBar } from '@presentation/components/common/ProgressBar';
import { ScalePressable } from '@presentation/components/common/ScalePressable';

const g = strings.growth;
const SCORE_RING = 112;
const BAR_HEIGHT = 72;
const PATTERN_HEIGHT = 56;
// Sıfır olmayan değer en az bu kadar dolu görünür
const MIN_FILL_PCT = 8;

const fillPct = (pct: number) => (pct > 0 ? Math.max(pct, MIN_FILL_PCT) : 0);

export function ScoreCard({
  score,
  bars,
}: {
  readonly score: number | null;
  readonly bars: TodayBars;
}) {
  const rows: { key: keyof TodayBars; color: string }[] = [
    { key: 'water', color: moduleColors.water },
    { key: 'tasks', color: moduleColors.success },
    { key: 'focus', color: moduleColors.focus },
    { key: 'mood', color: moduleColors.mood },
  ];
  return (
    <Panel style={styles.row}>
      <LiveRing
        size={SCORE_RING}
        progress={(score ?? 0) / 100}
        mood="calm"
        still
        accessibilityLabel={g.scoreA11y(score)}
      >
        <AppText variant="numeralL">{score ?? g.noValue}</AppText>
      </LiveRing>
      <View style={styles.flexGap}>
        <AppText variant="bodyStrong">{g.scoreTitle}</AppText>
        <AppText variant="footnote" style={styles.secondary}>
          {score === null ? g.scoreEmpty : g.scoreHint}
        </AppText>
        {rows.map(({ key, color }) => {
          const value = bars[key];
          return (
            <View
              key={key}
              style={styles.barRow}
              accessible
              accessibilityLabel={g.barA11y(g.bars[key], value)}
            >
              <AppText variant="footnote" style={styles.barLabel}>
                {g.bars[key]}
              </AppText>
              <View style={styles.flex}>
                <ProgressBar pct={value ?? 0} color={color} height={6} />
              </View>
            </View>
          );
        })}
      </View>
    </Panel>
  );
}

export function BalanceCard({ balance }: { readonly balance: DopamineBalance }) {
  const total = balance.lasting + balance.instant;
  const lastingFlex = total > 0 ? balance.lasting : 0;
  const instantFlex = total > 0 ? balance.instant : 0;
  return (
    <Panel style={styles.gap}>
      <View style={styles.titleRow}>
        <AppText variant="bodyStrong" style={styles.flex}>
          {g.balanceTitle}
        </AppText>
        <AppText variant="bodyStrong" style={{ color: dopamineColors.quality }}>
          {g.balancePct(balance.lastingPct)}
        </AppText>
      </View>
      <View
        style={styles.stack}
        accessible
        accessibilityLabel={g.balanceA11y(balance.lasting, balance.instant)}
      >
        {total === 0 ? <View style={[styles.flex, styles.stackEmpty]} /> : null}
        {lastingFlex > 0 ? (
          <View style={{ flex: lastingFlex, backgroundColor: dopamineColors.quality }} />
        ) : null}
        {instantFlex > 0 ? (
          <View style={{ flex: instantFlex, backgroundColor: dopamineColors.cheap }} />
        ) : null}
      </View>
      <View style={styles.titleRow}>
        <Legend color={dopamineColors.quality} label={g.balanceLasting(balance.lasting)} />
        <Legend color={dopamineColors.cheap} label={g.balanceInstant(balance.instant)} />
      </View>
      <AppText variant="footnote" style={styles.secondary}>
        {g.balanceHint}
      </AppText>
    </Panel>
  );
}

function Legend({ color, label }: { readonly color: string; readonly label: string }) {
  return (
    <View style={styles.legend}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <AppText variant="footnote">{label}</AppText>
    </View>
  );
}

export function PatternCard({
  pattern,
  caption,
}: {
  readonly pattern: UrgePattern;
  readonly caption?: string;
}) {
  const max = Math.max(1, ...URGE_SLOTS.map((slot) => pattern.counts[slot]));
  const message =
    pattern.total === 0
      ? g.patternEmpty
      : pattern.peak
        ? g.patternPeak(g.slots[pattern.peak])
        : g.patternEven;
  return (
    <Panel style={styles.gap}>
      <View style={styles.titleRow}>
        <AppText variant="bodyStrong" style={styles.flex}>
          {g.patternTitle}
        </AppText>
        {caption ? (
          <AppText variant="footnote" style={styles.secondary}>
            {caption}
          </AppText>
        ) : null}
      </View>
      <View style={styles.slots}>
        {URGE_SLOTS.map((slot) => {
          const count = pattern.counts[slot];
          return (
            <View
              key={slot}
              style={styles.slot}
              accessible
              accessibilityLabel={g.patternA11y(g.slots[slot], count)}
            >
              <View style={[styles.track, { height: PATTERN_HEIGHT }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      height: `${fillPct(Math.round((count / max) * 100))}%`,
                      backgroundColor:
                        slot === pattern.peak ? moduleColors.mood : colors.textDisabled,
                    },
                  ]}
                />
              </View>
              <AppText variant="footnote" style={styles.secondary}>
                {g.slots[slot]}
              </AppText>
            </View>
          );
        })}
      </View>
      <AppText variant="secondary">{message}</AppText>
    </Panel>
  );
}

export function MoodCard({ relation }: { readonly relation: MoodRelation }) {
  const insight = moodInsight(relation);
  const message =
    insight === 'habitsLift'
      ? g.moodLift(relation.goodDaysRate ?? 0, relation.hardDaysRate ?? 0)
      : insight === 'noClearLink'
        ? g.moodNoLink
        : g.moodNotEnough;
  return (
    <Panel style={styles.gap}>
      <View style={styles.titleRow}>
        <AppText variant="bodyStrong" style={styles.flex}>
          {g.moodTitle}
        </AppText>
        <AppText variant="footnote" style={styles.secondary}>
          {g.last30}
        </AppText>
      </View>
      <AppText variant="secondary">{message}</AppText>
    </Panel>
  );
}

export function WeekBars({
  days,
  today,
  a11y,
}: {
  readonly days: readonly { readonly date: string; readonly pct: number }[];
  readonly today: string;
  readonly a11y: (day: string, pct: number) => string;
}) {
  return (
    <View style={styles.bars}>
      {days.map((day) => {
        const label = formatShortDayName(day.date);
        return (
          <View
            key={day.date}
            style={styles.barCol}
            accessible
            accessibilityLabel={a11y(label, day.pct)}
          >
            <View style={[styles.track, styles.weekTrack]}>
              <View
                style={[
                  styles.fill,
                  { height: `${fillPct(day.pct)}%`, backgroundColor: colors.gold },
                ]}
              />
            </View>
            <AppText
              variant="footnote"
              style={day.date === today ? styles.todayLabel : styles.secondary}
            >
              {label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

export function StatTrio({
  items,
}: {
  readonly items: readonly { readonly value: number | string; readonly label: string }[];
}) {
  return (
    <View style={styles.stats}>
      {items.map((item) => (
        <View key={item.label} style={styles.flex}>
          <AppText variant="numeralL">{item.value}</AppText>
          <AppText variant="footnote" style={styles.secondary}>
            {item.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

export function NavRow({
  icon,
  label,
  hint,
  onPress,
}: {
  readonly icon: IconName;
  readonly label: string;
  readonly hint?: string;
  readonly onPress: () => void;
}) {
  return (
    <ScalePressable onPress={onPress} accessibilityRole="button" style={styles.link}>
      <Icon name={icon} size={20} color={colors.textPrimary} />
      <View style={styles.flex}>
        <AppText variant="bodyL">{label}</AppText>
        {hint ? (
          <AppText variant="footnote" style={styles.secondary}>
            {hint}
          </AppText>
        ) : null}
      </View>
      <Icon name="chevron-right" size={20} color={colors.textSecondary} />
    </ScalePressable>
  );
}

export function NavDivider() {
  return <View style={styles.divider} />;
}

const styles = themedStyles(() => ({
  flex: { flex: 1 },
  flexGap: { flex: 1, gap: spacing.xs },
  gap: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  secondary: { color: colors.textSecondary },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  barLabel: { width: 64, color: colors.textSecondary },
  stack: {
    flexDirection: 'row',
    height: 12,
    borderRadius: radius.full,
    overflow: 'hidden',
    gap: 2,
  },
  stackEmpty: { backgroundColor: colors.track },
  legend: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  slots: { flexDirection: 'row', gap: spacing.md },
  slot: { flex: 1, alignItems: 'center', gap: spacing.xs },
  track: {
    width: '100%',
    borderRadius: radius.sm,
    backgroundColor: colors.track,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weekTrack: { maxWidth: 28, height: BAR_HEIGHT },
  fill: { width: '100%', borderRadius: radius.sm },
  bars: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  barCol: { flex: 1, alignItems: 'center', gap: spacing.xs },
  todayLabel: { color: colors.textPrimary },
  stats: { flexDirection: 'row', gap: spacing.md },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.touchTarget + spacing.sm,
  },
  divider: { height: 1, backgroundColor: colors.border },
}));
