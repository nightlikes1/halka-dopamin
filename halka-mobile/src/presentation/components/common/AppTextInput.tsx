// Tema uyumlu metin girişi (en az 44 px yükseklik)
import { forwardRef } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { layout } from '@core/theme/layout';
import { themedStyles } from '@core/theme/themed';
import { useTheme } from '@core/theme/ThemeProvider';
import { colors, radius, spacing } from '@core/theme/tokens';
import { typography } from '@core/theme/typography';

export const AppTextInput = forwardRef<TextInput, TextInputProps>(function AppTextInput(
  { style, ...rest },
  ref,
) {
  const { palette } = useTheme();
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={colors.textDim}
      selectionColor={palette.accent}
      cursorColor={palette.accent}
      {...rest}
      style={[styles.input, style]}
    />
  );
});

const styles = themedStyles(() => ({
  input: {
    ...typography.body,
    minHeight: layout.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    backgroundColor: colors.bgInput,
  },
}));
