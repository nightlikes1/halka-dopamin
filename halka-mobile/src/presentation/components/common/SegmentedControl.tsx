// Pill içinde seçici (Pomodoro modu gibi): seçili seçenek kendi renginde dolu ve koyu yazılı
import { StyleSheet, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { ScalePressable } from '@presentation/components/common/ScalePressable';

export interface SegmentOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly color: string;
  readonly accessibilityLabel?: string;
}

interface SegmentedControlProps<T extends string> {
  readonly options: readonly SegmentOption<T>[];
  readonly selected: T;
  readonly onChange: (value: T) => void;
  readonly accessibilityLabel?: string;
  // Cam görünüm (parçacık ekranları): saydam zemin + ince kenarlık
  readonly glass?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  selected,
  onChange,
  accessibilityLabel,
  glass = false,
}: SegmentedControlProps<T>) {
  return (
    <View
      style={[styles.container, glass && styles.glass]}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <ScalePressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            aria-checked={active}
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            hitSlop={2}
            style={[styles.option, active && { backgroundColor: option.color }]}
          >
            <AppText
              variant="label"
              numberOfLines={1}
              style={[styles.label, active && styles.labelActive]}
            >
              {option.label}
            </AppText>
          </ScalePressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  glass: { borderWidth: 1, borderColor: colors.glassBorder, backgroundColor: colors.glass },
  option: {
    height: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: colors.textSecondary },
  labelActive: { color: colors.textOnAccent, fontFamily: fonts.bold },
});
