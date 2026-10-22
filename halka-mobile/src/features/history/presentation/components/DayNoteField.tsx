// Gün notu girişi: çok satırlı, 280 karakter sayaçlı
import { StyleSheet, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, fontSizes, spacing } from '@core/theme/tokens';
import { DAY_NOTE_MAX_LENGTH } from '@features/history/domain/entities';
import { AppText } from '@presentation/components/common/AppText';
import { AppTextInput } from '@presentation/components/common/AppTextInput';

interface DayNoteFieldProps {
  readonly value: string;
  readonly onChange: (text: string) => void;
  readonly label: string;
  readonly autoFocus?: boolean;
}

export function DayNoteField({ value, onChange, label, autoFocus = false }: DayNoteFieldProps) {
  const nearLimit = value.length > DAY_NOTE_MAX_LENGTH - 20;
  return (
    <View style={styles.field}>
      <AppText variant="label" style={styles.label}>
        {label}
      </AppText>
      <AppTextInput
        value={value}
        onChangeText={onChange}
        multiline
        textAlignVertical="top"
        maxLength={DAY_NOTE_MAX_LENGTH}
        placeholder={strings.checkIn.notePlaceholder}
        autoFocus={autoFocus}
        accessibilityLabel={label}
        style={styles.input}
      />
      <AppText style={[styles.counter, nearLimit && styles.counterWarn]}>
        {strings.history.charCount(value.length, DAY_NOTE_MAX_LENGTH)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { color: colors.textMuted },
  input: { minHeight: 96, paddingTop: spacing.md, lineHeight: 20 },
  counter: { alignSelf: 'flex-end', fontSize: fontSizes.xs, color: colors.textDim },
  counterWarn: { color: colors.textMain },
});
