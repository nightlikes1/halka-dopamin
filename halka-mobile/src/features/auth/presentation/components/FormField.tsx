// Etiketli form alanı (react-hook-form Controller ile kullanılır)
import { forwardRef } from 'react';
import { View, type TextInput, type TextInputProps } from 'react-native';
import { colors, fontSizes, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { AppTextInput } from '@presentation/components/common/AppTextInput';
import { themedStyles } from '@core/theme/themed';

interface FormFieldProps extends TextInputProps {
  readonly label: string;
  readonly error?: string;
}

export const FormField = forwardRef<TextInput, FormFieldProps>(function FormField(
  { label, error, ...inputProps },
  ref,
) {
  return (
    <View style={styles.field}>
      <AppText variant="label" style={styles.label}>
        {label}
      </AppText>
      <AppTextInput
        ref={ref}
        accessibilityLabel={label}
        style={error ? styles.inputError : undefined}
        {...inputProps}
      />
      {error ? (
        <AppText style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = themedStyles(() => ({
  field: { gap: spacing.xs },
  label: { color: colors.textMuted },
  inputError: { borderColor: colors.error },
  error: { color: colors.danger, fontSize: fontSizes.xs },
}));
