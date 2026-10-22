// Günün genel puanı (1-5): emoji + etiket; renk tek başına anlam taşımaz
import { Pressable, StyleSheet, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, radius, spacing, fontSizes } from '@core/theme/tokens';
import { DAY_RATINGS, type DayRating } from '@features/checkin/domain/entities';
import { AppText } from '@presentation/components/common/AppText';

const t = strings.checkIn;

interface RatingPickerProps {
  readonly value: DayRating | null;
  readonly onChange: (rating: DayRating) => void;
}

export function RatingPicker({ value, onChange }: RatingPickerProps) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={t.ratingQuestion}>
      {DAY_RATINGS.map((rating) => {
        const selected = rating === value;
        const label = t.ratingLabels[rating - 1] ?? '';
        return (
          <Pressable
            key={rating}
            onPress={() => onChange(rating)}
            accessibilityRole="radio"
            aria-checked={selected}
            accessibilityLabel={`${rating}: ${label}`}
            style={({ pressed }) => [
              styles.option,
              selected && styles.selected,
              pressed && styles.pressed,
            ]}
          >
            <AppText style={styles.emoji}>{t.ratingEmojis[rating - 1]}</AppText>
            <AppText style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
  option: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    backgroundColor: colors.fillSubtle,
  },
  selected: { borderColor: colors.textMain, backgroundColor: colors.fillMuted },
  pressed: { backgroundColor: colors.fillStrong },
  emoji: { fontSize: fontSizes.xl },
  label: { fontSize: fontSizes.xs, color: colors.textMuted },
  labelSelected: { color: colors.textMain },
});
