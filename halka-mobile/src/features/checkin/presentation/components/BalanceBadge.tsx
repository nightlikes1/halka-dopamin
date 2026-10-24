// Günün denge skoru göstergesi (0-100)
import { View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, fonts, fontSizes, radius, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { ProgressBar } from '@presentation/components/common/ProgressBar';
import { themedStyles } from '@core/theme/themed';

interface BalanceBadgeProps {
  readonly score: number;
}

export function BalanceBadge({ score }: BalanceBadgeProps) {
  return (
    <View
      style={styles.box}
      accessibilityRole="text"
      accessibilityLabel={`${strings.checkIn.score}: ${score} / 100`}
    >
      <View style={styles.row}>
        <AppText variant="muted">{strings.checkIn.score}</AppText>
        <AppText style={styles.score}>
          {score}
          <AppText style={styles.max}> / 100</AppText>
        </AppText>
      </View>
      <ProgressBar pct={score} color={colors.textMain} height={6} />
    </View>
  );
}

const styles = themedStyles(() => ({
  box: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bgCardPressed,
  },
  row: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  score: { fontFamily: fonts.mono, fontSize: fontSizes.xl, color: colors.textMain },
  max: { fontFamily: fonts.mono, fontSize: fontSizes.sm, color: colors.textDim },
}));
