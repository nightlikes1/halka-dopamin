// Giriş/kayıt ve şifre sıfırlama form doğrulaması (sunucudaki kurallarla aynı)
import { z } from 'zod';
import { strings } from '@core/i18n/tr';

const t = strings.auth;

const email = z.string().trim().pipe(z.email(t.emailInvalid));

export const loginFormSchema = z.object({
  email,
  password: z.string().min(1, t.passwordRequired),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z.object({
  email,
  password: z.string().min(8, t.passwordTooShort).max(128),
  displayName: z.string().trim().max(40, t.displayNameTooLong),
});
export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const forgotPasswordFormSchema = z.object({
  email,
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordFormSchema = z
  .object({
    password: z.string().min(8, t.passwordTooShort).max(128),
    confirmPassword: z.string().min(1, t.passwordRequired),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t.passwordsDoNotMatch,
    path: ['confirmPassword'],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
