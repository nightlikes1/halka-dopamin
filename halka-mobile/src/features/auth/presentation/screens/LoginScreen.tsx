// Giriş ekranı
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, type TextInput } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, fontSizes, spacing } from '@core/theme/tokens';
import { loginFormSchema, type LoginFormValues } from '@features/auth/presentation/authSchemas';
import { AuthLayout } from '@features/auth/presentation/components/AuthLayout';
import { FormField } from '@features/auth/presentation/components/FormField';
import { useAuth } from '@features/auth/presentation/useAuth';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { Chip } from '@presentation/components/common/Chip';
import type { RootStackScreenProps } from '@presentation/navigation/types';

const t = strings.auth;

export function LoginScreen({ navigation }: RootStackScreenProps<'Login'>) {
  const { login } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit(async (values) => {
    setSubmitError(await login(values));
  });

  return (
    <AuthLayout title={t.loginTitle} subtitle={t.loginSubtitle}>
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
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <FormField
            ref={passwordRef}
            label={t.password}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={formState.errors.password?.message}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={() => void submit()}
          />
        )}
      />
      <Pressable
        onPress={() => navigation.navigate('ForgotPassword')}
        style={styles.forgotPasswordButton}
        accessibilityRole="button"
        accessibilityLabel={t.forgotPassword}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <AppText style={styles.forgotPasswordText}>{t.forgotPassword}</AppText>
      </Pressable>
      {submitError ? (
        <AppText style={styles.error} accessibilityLiveRegion="assertive">
          {submitError}
        </AppText>
      ) : null}
      <ActionButton
        label={t.login}
        variant="solid"
        disabled={formState.isSubmitting}
        onPress={() => void submit()}
      />
      <Chip label={t.toRegister} onPress={() => navigation.replace('Register')} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
  },
  forgotPasswordText: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
  },
  error: { color: colors.danger, fontSize: fontSizes.sm },
});
