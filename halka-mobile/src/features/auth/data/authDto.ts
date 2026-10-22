// API yanıt DTO'ları (zod ile doğrulanır) ve entity dönüşümleri
import { z } from 'zod';
import type { AuthSession, AuthUser } from '@features/auth/domain/entities';

export const userDtoSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string().nullable(),
});

export const authResponseDtoSchema = z.object({
  token: z.string().min(1),
  user: userDtoSchema,
});

export const meResponseDtoSchema = z.object({ user: userDtoSchema });

export type UserDto = z.infer<typeof userDtoSchema>;
export type AuthResponseDto = z.infer<typeof authResponseDtoSchema>;

export const toAuthUser = (dto: UserDto): AuthUser => ({
  id: dto.id,
  email: dto.email,
  displayName: dto.displayName,
});

export const toAuthSession = (dto: AuthResponseDto): AuthSession => ({
  token: dto.token,
  user: toAuthUser(dto.user),
});

// Cihazda saklanan oturum biçimi API yanıtıyla aynıdır
export const storedSessionSchema = authResponseDtoSchema;
