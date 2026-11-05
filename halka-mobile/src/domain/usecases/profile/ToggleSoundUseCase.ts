// Sesleri açar/kapatır; tercih kalıcı olarak saklanır
import { ok, type AsyncResult } from '@core/result/Result';
import type { Profile } from '@domain/entities/Profile';
import type { AudioPort, IEntityRepository } from '@domain/ports';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class ToggleSoundUseCase {
  constructor(
    private readonly repository: IEntityRepository<Profile>,
    private readonly audio: AudioPort,
  ) {}

  async execute(): AsyncResult<Profile> {
    const result = await updateEntity(this.repository, (profile) =>
      ok({ ...profile, soundEnabled: !profile.soundEnabled }),
    );
    // Kapatılınca çalan ortam sesi de durur (AudioPort sorumluluğu)
    if (result.ok) this.audio.setEnabled(result.value.soundEnabled);
    return result;
  }
}
