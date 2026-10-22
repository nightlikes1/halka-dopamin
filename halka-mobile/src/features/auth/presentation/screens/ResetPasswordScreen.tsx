// Yeni şifre belirleme (şifre sıfırlama) ekranı
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View, type TextInput } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, fontSizes, spacing } from '@core/theme/tokens';
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
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

export function ResetPasswordScreen({ route, navigation }: RootStackScreenProps<'ResetPassword'>) {
  const { resetPassword } = useAuth();
  const confirmPasswordRef = useRef<TextInput>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Belirteç React Navigation route params, web query veya Supabase hash (#access_token=...) üzerinden çözülür
  const token = useMemo(() => {
    const fromParams = route.params?.token;
    if (fromParams) return fromParams;
    if (typeof window !== 'undefined') {
      if (window.location?.search) {
        const searchParams = new URLSearchParams(window.location.search);
        const queryToken = searchParams.get('token') || searchParams.get('access_token');
        if (queryToken) return queryToken;
      }
      if (window.location?.hash) {
        const hash = window.location.hash.replace(/^#/, '');
        const hashParams = new URLSearchParams(hash);
        const hashToken = hashParams.get('access_token') || hashParams.get('token');
        if (hashToken) return hashToken;
      }
    }
    return '';
  }, [route.params?.token]);

  const { control, handleSubmit, formState } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const submit = handleSubmit(async (values) => {
    if (!token) {
      setSubmitError(t.missingToken);
      return;
    }
    setSubmitError(null);
    const error = await resetPassword(token, values.password);
    if (error) {
      setSubmitError(error);
    } else {
      setIsSuccess(true);
    }
  });

  if (isSuccess) {
    return (
      <AuthLayout title={t.resetPasswordTitle} subtitle={t.resetPasswordSubtitle}>
        <View style={styles.successBox}>
          <View style={styles.iconCircle}>
            <Icon name="check" size={24} color={colors.gold} />
          </View>
          <AppText style={styles.successText}>{t.resetPasswordSuccess}</AppText>
        </View>
        <ActionButton
          label={t.login}
          variant="solid"
          onPress={() => navigation.navigate('Login')}
        />
      </AuthLayout>
    );
  }

  if (!token) {
    return (
      <AuthLayout title={t.resetPasswordTitle} subtitle={t.resetPasswordSubtitle}>
        <View style={styles.warningBox}>
          <View style={styles.warningIconCircle}>
            <Icon name="alert-circle" size={24} color={colors.danger} />
          </View>
          <AppText style={styles.warningText}>{t.missingToken}</AppText>
        </View>
        <ActionButton
          label={t.forgotPasswordTitle}
          variant="solid"
          onPress={() => navigation.navigate('ForgotPassword')}
        />
        <Chip label={t.backToLogin} onPress={() => navigation.navigate('Login')} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t.resetPasswordTitle} subtitle={t.resetPasswordSubtitle}>
      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <FormField
            label={t.newPassword}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={formState.errors.password?.message}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { value, onChange, onBlur } }) => (
          <FormField
            ref={confirmPasswordRef}
            label={t.confirmPassword}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={formState.errors.confirmPassword?.message}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
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
        label={t.updatePassword}
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
  warningBox: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  warningIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  warningText: {
    color: colors.textPrimary,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
});
