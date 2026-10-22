// Şifremi unuttum ekranı
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, fontSizes, spacing } from '@core/theme/tokens';
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from '@features/auth/presentation/authSchemas';
import { AuthLayout } from '@features/auth/presentation/components/AuthLayout';
import { FormField } from '@features/auth/presentation/components/FormField';
import { useAuth } from '@features/auth/presentation/useAuth';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { Chip } from '@presentation/components/common/Chip';
import { Icon } from '@presentation/components/common/Icon';
import type { RootStackScreenProps } from '@presentation/navigation/types';

const t = strings.auth;

export function ForgotPasswordScreen({ navigation }: RootStackScreenProps<'ForgotPassword'>) {
  const { forgotPassword } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { control, handleSubmit, formState } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: '' },
  });

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    const error = await forgotPassword(values.email);
    if (error) {
      setSubmitError(error);
    } else {
      setIsSuccess(true);
    }
  });

  if (isSuccess) {
    return (
      <AuthLayout title={t.forgotPasswordTitle} subtitle={t.forgotPasswordSubtitle}>
        <View style={styles.successBox}>
          <View style={styles.iconCircle}>
            <Icon name="check" size={24} color={colors.gold} />
          </View>
          <AppText style={styles.successText}>{t.resetLinkSent}</AppText>
        </View>
        <ActionButton
          label={t.backToLogin}
          variant="solid"
          onPress={() => navigation.navigate('Login')}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t.forgotPasswordTitle} subtitle={t.forgotPasswordSubtitle}>
      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur } }) => (
          <FormField
            label={t.email}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={formState.errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="go"
            onSubmitEditing={() => void submit()}
          />
        )}
      />
      {submitError ? (
        <AppText style={styles.error} accessibilityLiveRegion="assertive">
          {submitError}
        </AppText>
      ) : null}
      <ActionButton
        label={t.sendResetLink}
        variant="solid"
        disabled={formState.isSubmitting}
        onPress={() => void submit()}
      />
      <Chip label={t.backToLogin} onPress={() => navigation.navigate('Login')} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, fontSize: fontSizes.sm },
  successBox: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  successText: {
    color: colors.textPrimary,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
});
