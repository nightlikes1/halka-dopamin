// Özellik satırı: ad, 7 günlük ilerleme, bağlı alışkanlık sayısı, bugünkü durum
import { Pressable, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, fontSizes, radius, spacing } from '@core/theme/tokens';
import type { TraitSummary } from '@features/character/domain/usecases/CharacterUseCases';
import { AppText } from '@presentation/components/common/AppText';
import { ProgressBar } from '@presentation/components/common/ProgressBar';
import { themedStyles } from '@core/theme/themed';

const t = strings.character;

interface TraitRowProps {
  readonly summary: TraitSummary;
  readonly onPress: () => void;
}

export function TraitRow({ summary, onPress }: TraitRowProps) {
  const { trait, today, weekAverage } = summary;
  const percent = weekAverage === null ? null : Math.round(weekAverage);
  const todayText = today.answered === 0 ? t.todayUnknown : t.todayDone(today.done, today.answered);
  const meta = `${t.habitCount(today.linked)} · ${todayText}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${trait.name}, ${percent === null ? t.noDayValue : t.proximityA11y(percent)}, ${meta}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <AppText variant="subtitle" style={styles.name} numberOfLines={1}>
          {trait.name}
        </AppText>
        <AppText style={styles.percent}>{percent === null ? '—' : `%${percent}`}</AppText>
        <AppText style={styles.chevron}>›</AppText>
      </View>
      <ProgressBar pct={percent ?? 0} color={colors.textMuted} height={6} />
      <AppText variant="dim">{meta}</AppText>
    </Pressable>
  );
}

const styles = themedStyles(() => ({
  row: {
    gap: spacing.sm,
    minHeight: 44,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bgCardPressed,
  },
  pressed: { opacity: 0.7 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flex: 1 },
  percent: { fontSize: fontSizes.sm, color: colors.textMuted },
  chevron: { fontSize: fontSizes.lg, color: colors.textDim },
}));
