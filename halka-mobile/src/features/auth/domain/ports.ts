// Oturum için repository ve port sözleşmeleri
import type { AsyncResult } from '@core/result/Result';
import type {
  AuthSession,
  AuthUser,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '@features/auth/domain/entities';

export interface AuthRepository {
  login(input: LoginInput): AsyncResult<AuthSession>;
  register(input: RegisterInput): AsyncResult<AuthSession>;
  fetchCurrentUser(): AsyncResult<AuthUser>;
  forgotPassword(input: ForgotPasswordInput): AsyncResult<string>;
  resetPassword(input: ResetPasswordInput): AsyncResult<string>;
}

// Oturumun cihazda güvenli saklanması (token + son bilinen kullanıcı)
export interface SessionStorage {
  load(): AsyncResult<AuthSession | null>;
  save(session: AuthSession): AsyncResult<void>;
  clear(): AsyncResult<void>;
}

export interface ServerHealthPort {
  isReachable(): Promise<boolean>;
}
