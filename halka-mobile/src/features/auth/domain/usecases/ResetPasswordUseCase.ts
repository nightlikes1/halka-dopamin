// Belirteç ve yeni şifreyle şifreyi sıfırlar
import type { AsyncResult } from '@core/result/Result';
import type { ResetPasswordInput } from '@features/auth/domain/entities';
import type { AuthRepository } from '@features/auth/domain/ports';

export class ResetPasswordUseCase {
  constructor(private readonly repository: AuthRepository) {}

  execute(input: ResetPasswordInput): AsyncResult<string> {
    return this.repository.resetPassword(input);
  }
}
