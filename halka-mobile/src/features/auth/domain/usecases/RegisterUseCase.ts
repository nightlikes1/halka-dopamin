// Yeni hesap oluşturur ve oturumu başlatır
import { ok, type AsyncResult } from '@core/result/Result';
import type { AuthSession, RegisterInput } from '@features/auth/domain/entities';
import type { AuthRepository, SessionStorage } from '@features/auth/domain/ports';

export class RegisterUseCase {
  constructor(
    private readonly repository: AuthRepository,
    private readonly sessions: SessionStorage,
  ) {}

  async execute(input: RegisterInput): AsyncResult<AuthSession> {
    const displayName = input.displayName?.trim();
    const result = await this.repository.register({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      ...(displayName ? { displayName } : {}),
    });
    if (!result.ok) return result;

    const saved = await this.sessions.save(result.value);
    return saved.ok ? ok(result.value) : saved;
  }
}
