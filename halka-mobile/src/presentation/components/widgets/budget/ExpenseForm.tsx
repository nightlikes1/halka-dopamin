// Harcama ekleme formu (react-hook-form + zod)
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { spacing } from '@core/theme/tokens';
import { EXPENSE_LABEL_MAX_LENGTH } from '@domain/entities/Budget';
import type { AddExpenseInput } from '@domain/usecases/budget/AddExpenseUseCase';
import { AppText } from '@presentation/components/common/AppText';
import { AppTextInput } from '@presentation/components/common/AppTextInput';
import { Chip } from '@presentation/components/common/Chip';
import { themedStyles } from '@core/theme/themed';
import { widgetStyles } from '@presentation/components/widgets/widgetStyles';
import {
  expenseFormSchema,
  parseAmount,
  type ExpenseFormValues,
} from '@presentation/forms/schemas';

interface ExpenseFormProps {
  readonly accent: string;
  readonly withLabel: boolean;
  readonly onAdd: (input: AddExpenseInput) => Promise<boolean>;
}

export function ExpenseForm({ accent, withLabel, onAdd }: ExpenseFormProps) {
  const { control, handleSubmit, reset, formState } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: { amount: '', label: '' },
  });

  const submit = handleSubmit(async ({ amount, label }) => {
    if (await onAdd({ amount: parseAmount(amount), label })) reset({ amount: '', label: '' });
  });

  const error = formState.errors.amount?.message ?? formState.errors.label?.message;

  return (
    <View style={styles.wrapper}>
      {withLabel ? (
        <Controller
          control={control}
          name="label"
          render={({ field: { value, onChange, onBlur } }) => (
            <AppTextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Açıklama (isteğe bağlı)"
              maxLength={EXPENSE_LABEL_MAX_LENGTH}
              accessibilityLabel="Harcama açıklaması"
            />
          )}
        />
      ) : null}
      <View style={widgetStyles.row}>
        <Controller
          control={control}
          name="amount"
          render={({ field: { value, onChange, onBlur } }) => (
            <AppTextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={withLabel ? 'Harcama tutarı (₺)' : 'Harcama ekle (₺)'}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={() => void submit()}
              style={styles.amount}
              accessibilityLabel="Harcama tutarı"
            />
          )}
        />
        <Chip
          label="Ekle"
          icon="plus"
          variant="primary"
          accent={accent}
          onPress={() => void submit()}
          accessibilityLabel="Harcama ekle"
        />
      </View>
      {error && formState.isSubmitted ? (
        <AppText style={widgetStyles.errorText}>{error}</AppText>
      ) : null}
    </View>
  );
}

const styles = themedStyles(() => ({
  wrapper: { gap: spacing.sm },
  amount: { flex: 1 },
}));
