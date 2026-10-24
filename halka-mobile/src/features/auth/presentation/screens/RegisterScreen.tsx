// Kayıt ekranı
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { type TextInput } from 'react-native';
import { strings } from '@core/i18n/tr';
import { colors, fontSizes } from '@core/theme/tokens';
import {
  registerFormSchema,
  type RegisterFormValues,
} from '@features/auth/presentation/authSchemas';
import { AuthLayout } from '@features/auth/presentation/components/AuthLayout';
import { FormField } from '@features/auth/presentation/components/FormField';
import { themedStyles } from '@core/theme/themed';
import { useAuth } from '@features/auth/presentation/useAuth';
import { ActionButton } from '@presentation/components/common/ActionButton';
import { AppText } from '@presentation/components/common/AppText';
import { Chip } from '@presentation/components/common/Chip';
import type { RootStackScreenProps } from '@presentation/navigation/types';

const t = strings.auth;

export function RegisterScreen({ navigation }: RootStackScreenProps<'Register'>) {
  const { register } = useAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { control, handleSubmit, formState } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { displayName: '', email: '', password: '' },
  });

  const submit = handleSubmit(async (values) => {
    setSubmitError(await register(values));
  });

  return (
    <AuthLayout title={t.registerTitle} subtitle={t.registerSubtitle}>
      <Controller
        control={control}
        name="displayName"
        render={({ field: { value, onChange, onBlur } }) => (
          <FormField
            label={t.displayName}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={formState.errors.displayName?.message}
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            maxLength={40}
            onSubmitEditing={() => emailRef.current?.focus()}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur } }) => (
          <FormField
            ref={emailRef}
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
        label={t.register}
        variant="solid"
        disabled={formState.isSubmitting}
        onPress={() => void submit()}
      />
      <Chip label={t.toLogin} onPress={() => navigation.replace('Login')} />
    </AuthLayout>
  );
}

const styles = themedStyles(() => ({
  error: { color: colors.danger, fontSize: fontSizes.sm },
}));
