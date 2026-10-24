// Bir alışkanlık için iki seçenekli cevap: iyi → Yaptım/Yapmadım, kötü → Uzak durdum/Yaptım
import { Pressable, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { themedStyles } from '@core/theme/themed';
import { withAlpha } from '@core/theme/palettes';
import { colors, dopamineColors, radius, spacing } from '@core/theme/tokens';
import type { Habit, HabitEntryStatus } from '@features/habits/domain/entities';
import { AppText } from '@presentation/components/common/AppText';
import { Icon, type IconName } from '@presentation/components/common/Icon';

const t = strings.checkIn;

interface Option {
  readonly status: HabitEntryStatus;
  readonly label: string;
  readonly icon: IconName;
  readonly color: string;
}

const optionsFor = (habit: Habit): readonly [Option, Option] =>
  habit.kind === 'build'
    ? [
        { status: 'done', label: t.done, icon: 'check', color: dopamineColors.quality },
        { status: 'missed', label: t.missed, icon: 'minus', color: dopamineColors.cheap },
      ]
    : [
        { status: 'clean', label: t.clean, icon: 'check', color: dopamineColors.quality },
        { status: 'slip', label: t.slip, icon: 'alert-circle', color: dopamineColors.cheap },
      ];

interface HabitAnswerRowProps {
  readonly habit: Habit;
  readonly value: HabitEntryStatus | undefined;
  // Seçili seçeneğe tekrar dokunmak cevabı temizler
  readonly onChange: (status: HabitEntryStatus | undefined) => void;
}

export function HabitAnswerRow({ habit, value, onChange }: HabitAnswerRowProps) {
  return (
    <View style={styles.row}>
      <AppText>{habit.title}</AppText>
      <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel={habit.title}>
        {optionsFor(habit).map((option) => {
          const selected = value === option.status;
          const color = selected ? option.color : colors.textMuted;
          return (
            <Pressable
              key={option.status}
              onPress={() => onChange(selected ? undefined : option.status)}
              accessibilityRole="radio"
              aria-checked={selected}
              accessibilityLabel={`${habit.title}: ${option.label}`}
              style={({ pressed }) => [
                styles.option,
                selected && {
                  borderColor: option.color,
                  backgroundColor: withAlpha(option.color, '26'),
                },
                pressed && styles.pressed,
              ]}
            >
              <Icon name={option.icon} size={16} color={color} />
              <AppText variant="label" style={{ color }}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = themedStyles(() => ({
  row: { gap: spacing.sm, paddingVertical: spacing.sm },
  options: { flexDirection: 'row', gap: spacing.sm },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: layout.touchTarget,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    backgroundColor: colors.fillSubtle,
  },
  pressed: { backgroundColor: colors.fillStrong },
}));
