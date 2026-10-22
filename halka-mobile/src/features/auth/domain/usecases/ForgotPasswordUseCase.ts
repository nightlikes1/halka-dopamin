// Şifremi unuttum isteği gönderir
import type { AsyncResult } from '@core/result/Result';
import type { ForgotPasswordInput } from '@features/auth/domain/entities';
import type { AuthRepository } from '@features/auth/domain/ports';

export class ForgotPasswordUseCase {
  constructor(private readonly repository: AuthRepository) {}

  execute(input: ForgotPasswordInput): AsyncResult<string> {
    return this.repository.forgotPassword({
      email: input.email.trim().toLowerCase(),
    });
  }
}
