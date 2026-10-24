// Yeni görev formu (react-hook-form + zod)
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { spacing } from '@core/theme/tokens';
import { TASK_TEXT_MAX_LENGTH } from '@domain/entities/Task';
import { AppText } from '@presentation/components/common/AppText';
import { AppTextInput } from '@presentation/components/common/AppTextInput';
import { Chip } from '@presentation/components/common/Chip';
import { themedStyles } from '@core/theme/themed';
import { widgetStyles } from '@presentation/components/widgets/widgetStyles';
import { taskFormSchema, type TaskFormValues } from '@presentation/forms/schemas';

interface TaskAddFormProps {
  readonly accent: string;
  readonly onAdd: (text: string) => Promise<boolean>;
}

export function TaskAddForm({ accent, onAdd }: TaskAddFormProps) {
  const { control, handleSubmit, reset, formState } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { text: '' },
  });

  const submit = handleSubmit(async ({ text }) => {
    if (await onAdd(text)) reset({ text: '' });
  });

  return (
    <View style={styles.wrapper}>
      <View style={widgetStyles.row}>
        <Controller
          control={control}
          name="text"
          render={({ field: { value, onChange, onBlur } }) => (
            <AppTextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Yeni görev ekle..."
              maxLength={TASK_TEXT_MAX_LENGTH}
              returnKeyType="done"
              submitBehavior="submit"
              onSubmitEditing={() => void submit()}
              style={styles.input}
              accessibilityLabel="Yeni görev"
            />
          )}
        />
        <Chip
          label="Ekle"
          icon="plus"
          variant="primary"
          accent={accent}
          onPress={() => void submit()}
          accessibilityLabel="Görev ekle"
        />
      </View>
      {formState.errors.text && formState.isSubmitted ? (
        <AppText style={widgetStyles.errorText}>{formState.errors.text.message}</AppText>
      ) : null}
    </View>
  );
}

const styles = themedStyles(() => ({
  wrapper: { gap: spacing.xs },
  input: { flex: 1 },
}));
