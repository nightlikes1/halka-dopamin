// E-posta ve şifreyle giriş yapar, oturumu cihazda saklar
import { ok, type AsyncResult } from '@core/result/Result';
import type { AuthSession, LoginInput } from '@features/auth/domain/entities';
import type { AuthRepository, SessionStorage } from '@features/auth/domain/ports';

export class LoginUseCase {
  constructor(
    private readonly repository: AuthRepository,
    private readonly sessions: SessionStorage,
  ) {}

  async execute(input: LoginInput): AsyncResult<AuthSession> {
    const result = await this.repository.login({
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });
    if (!result.ok) return result;

    const saved = await this.sessions.save(result.value);
    return saved.ok ? ok(result.value) : saved;
  }
}
