// Tek alanlı metin diyaloğu — web'deki prompt() karşılığı (Alert.prompt yalnızca iOS'ta var)
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing, fontSizes } from '@core/theme/tokens';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { AppTextInput } from '@presentation/components/common/AppTextInput';
import { Chip } from '@presentation/components/common/Chip';
import { createTextDialogSchema, type TextDialogValues } from '@presentation/forms/schemas';

interface TextInputDialogProps {
  readonly visible: boolean;
  readonly title: string;
  readonly initialValue: string;
  readonly maxLength: number;
  readonly emptyMessage: string;
  readonly placeholder?: string;
  readonly onSubmit: (value: string) => Promise<boolean>;
  readonly onClose: () => void;
}

export function TextInputDialog({
  visible,
  title,
  initialValue,
  maxLength,
  emptyMessage,
  placeholder,
  onSubmit,
  onClose,
}: TextInputDialogProps) {
  const schema = useMemo(
    () => createTextDialogSchema(maxLength, emptyMessage),
    [maxLength, emptyMessage],
  );
  const { control, handleSubmit, reset, formState } = useForm<TextDialogValues>({
    resolver: zodResolver(schema),
    defaultValues: { value: initialValue },
  });

  // Her açılışta güncel değerle başla
  useEffect(() => {
    if (visible) reset({ value: initialValue });
  }, [visible, initialValue, reset]);

  const submit = handleSubmit(async ({ value }) => {
    if (await onSubmit(value)) onClose();
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="Kapat">
          <Pressable style={styles.dialog} onPress={() => undefined}>
            <AppText variant="title">{title}</AppText>
            <Controller
              control={control}
              name="value"
              render={({ field: { value, onChange, onBlur } }) => (
                <AppTextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={() => void submit()}
                />
              )}
            />
            {formState.errors.value ? (
              <AppText style={styles.error}>{formState.errors.value.message}</AppText>
            ) : null}
            <View style={styles.actions}>
              <Chip label="Vazgeç" onPress={onClose} />
              <ActionButton label="Kaydet" variant="solid" onPress={() => void submit()} />
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgSecondary,
  },
  error: { color: colors.danger, fontSize: fontSizes.sm },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
