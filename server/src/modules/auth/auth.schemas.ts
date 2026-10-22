// Giriş/kayıt istek doğrulama şemaları
import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;

const email = z.string().trim().toLowerCase().pipe(z.email('Geçerli bir e-posta adresi gir.'));

export const registerBodySchema = z.object({
  email,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Şifre en az ${PASSWORD_MIN_LENGTH} karakter olmalı.`)
    .max(128, 'Şifre çok uzun.'),
  displayName: z.string().trim().min(1).max(40).optional(),
});
export type RegisterInput = z.infer<typeof registerBodySchema>;

export const loginBodySchema = z.object({
  email,
  password: z.string().min(1, 'Şifre gerekli.'),
});
export type LoginInput = z.infer<typeof loginBodySchema>;

export const forgotPasswordBodySchema = z.object({
  email,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordBodySchema>;

export const resetPasswordBodySchema = z.object({
  token: z.string().min(1, 'Sıfırlama belirteci gerekli.'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Şifre en az ${PASSWORD_MIN_LENGTH} karakter olmalı.`)
    .max(128, 'Şifre çok uzun.'),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordBodySchema>;

// İstemciye dönen kullanıcı (şifre hash'i asla dönmez)
export interface PublicUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string | null;
}

export interface AuthResponse {
  readonly token: string;
  readonly user: PublicUser;
}
