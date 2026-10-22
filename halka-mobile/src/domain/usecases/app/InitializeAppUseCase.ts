// Açılış akışı: günlük sıfırlama -> durumu yükle -> ses tercihini uygula
import type { AsyncResult } from '@core/result/Result';
import type { HalkaSnapshot } from '@domain/entities/HalkaSnapshot';
import type { AudioPort } from '@domain/ports/AudioPort';
import type { LoadSnapshotUseCase } from '@domain/usecases/app/LoadSnapshotUseCase';
import type { RunDailyResetUseCase } from '@domain/usecases/app/RunDailyResetUseCase';

export class InitializeAppUseCase {
  constructor(
    private readonly runDailyReset: RunDailyResetUseCase,
    private readonly loadSnapshot: LoadSnapshotUseCase,
    private readonly audio: AudioPort,
  ) {}

  async execute(): AsyncResult<HalkaSnapshot> {
    const reset = await this.runDailyReset.execute();
    if (!reset.ok) return reset;

    const snapshot = await this.loadSnapshot.execute();
    if (snapshot.ok) this.audio.setEnabled(snapshot.value.profile.soundEnabled);
    return snapshot;
  }
}
