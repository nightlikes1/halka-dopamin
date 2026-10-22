// Oturum varlıkları

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string | null;
}

export interface AuthSession {
  readonly token: string;
  readonly user: AuthUser;
}

export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

export interface RegisterInput extends LoginInput {
  readonly displayName?: string;
}

export interface ForgotPasswordInput {
  readonly email: string;
}

export interface ResetPasswordInput {
  readonly token: string;
  readonly password: string;
}
