// Oturumu cihazdan siler
import type { AsyncResult } from '@core/result/Result';
import type { SessionStorage } from '@features/auth/domain/ports';

export class LogoutUseCase {
  constructor(private readonly sessions: SessionStorage) {}

  execute(): AsyncResult<void> {
    return this.sessions.clear();
  }
}
