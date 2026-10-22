// Açılışta kayıtlı oturumu geri yükler.
// Sunucuya ulaşılamazsa (çevrimdışı) son bilinen oturumla devam edilir;
// yalnızca sunucu oturumu açıkça reddederse (401) oturum silinir.
import { ok, type AsyncResult } from '@core/result/Result';
import type { AuthSession } from '@features/auth/domain/entities';
import type { AuthRepository, SessionStorage } from '@features/auth/domain/ports';

export class RestoreSessionUseCase {
  constructor(
    private readonly repository: AuthRepository,
    private readonly sessions: SessionStorage,
  ) {}

  async execute(): AsyncResult<AuthSession | null> {
    const stored = await this.sessions.load();
    if (!stored.ok) return stored;
    const session = stored.value;
    if (!session) return ok(null);

    const current = await this.repository.fetchCurrentUser();
    if (current.ok) {
      const refreshed: AuthSession = { ...session, user: current.value };
      await this.sessions.save(refreshed);
      return ok(refreshed);
    }

    if (current.error.kind === 'auth') {
      await this.sessions.clear();
      return ok(null);
    }

    // Ağ/sunucu hatası: kullanıcıyı dışarı atmadan önbellekteki oturumla devam et
    return ok(session);
  }
}
