// Kendi API'mize (Fastify) HTTP ile bağlanan auth repository; try/catch burada toplanır
import type { AxiosInstance } from 'axios';
import { ServerFailure } from '@core/errors/Failure';
import { toFailure } from '@core/api/httpClient';
import { strings } from '@core/i18n/tr';
import { err, ok, type AsyncResult } from '@core/result/Result';
import {
  authResponseDtoSchema,
  meResponseDtoSchema,
  toAuthSession,
  toAuthUser,
} from '@features/auth/data/authDto';
import type {
  AuthSession,
  AuthUser,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '@features/auth/domain/entities';
import type { AuthRepository, ServerHealthPort } from '@features/auth/domain/ports';

const INVALID_RESPONSE = 'Sunucudan beklenmeyen bir yanıt geldi.';

export class HttpAuthRepository implements AuthRepository, ServerHealthPort {
  constructor(private readonly http: AxiosInstance) {}

  login(input: LoginInput): AsyncResult<AuthSession> {
    return this.postSession('/auth/login', input);
  }

  register(input: RegisterInput): AsyncResult<AuthSession> {
    return this.postSession('/auth/register', input);
  }

  async fetchCurrentUser(): AsyncResult<AuthUser> {
    try {
      const response = await this.http.get<unknown>('/me');
      const parsed = meResponseDtoSchema.safeParse(response.data);
      return parsed.success
        ? ok(toAuthUser(parsed.data.user))
        : err(new ServerFailure(INVALID_RESPONSE));
    } catch (error) {
      return err(toFailure(error));
    }
  }

  async forgotPassword(input: ForgotPasswordInput): AsyncResult<string> {
    try {
      const response = await this.http.post<{ message?: string }>('/auth/forgot-password', {
        email: input.email,
      });
      const message =
        typeof response.data === 'object' && response.data !== null && 'message' in response.data
          ? String(response.data.message)
          : strings.auth.resetLinkSent;
      return ok(message);
    } catch (error) {
      return err(toFailure(error));
    }
  }

  async resetPassword(input: ResetPasswordInput): AsyncResult<string> {
    try {
      const response = await this.http.post<{ message?: string }>('/auth/reset-password', {
        token: input.token,
        password: input.password,
      });
      const message =
        typeof response.data === 'object' && response.data !== null && 'message' in response.data
          ? String(response.data.message)
          : strings.auth.resetPasswordSuccess;
      return ok(message);
    } catch (error) {
      return err(toFailure(error));
    }
  }

  async isReachable(): Promise<boolean> {
    try {
      const response = await this.http.get('/health', { timeout: 4000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  private async postSession(path: string, body: LoginInput): AsyncResult<AuthSession> {
    try {
      const response = await this.http.post<unknown>(path, body);
      const parsed = authResponseDtoSchema.safeParse(response.data);
      return parsed.success
        ? ok(toAuthSession(parsed.data))
        : err(new ServerFailure(INVALID_RESPONSE));
    } catch (error) {
      return err(toFailure(error));
    }
  }
}
