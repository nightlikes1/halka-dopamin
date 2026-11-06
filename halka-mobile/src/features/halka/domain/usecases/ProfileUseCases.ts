// Profil ve görünüm tercihleri
import { ValidationFailure } from '@core/errors/Failure';
import { type AsyncResult, err, ok } from '@core/result/Result';
import {
  PROFILE_NAME_MAX_LENGTH,
  type Profile,
  type ViewMode,
} from '@features/halka/domain/entities/Profile';
import type { AudioPort, IEntityRepository } from '@features/halka/domain/ports';
import { updateEntity } from '@features/halka/domain/usecases/updateEntity';

// Kokpit / Panel görünüm modunu değiştirir
export class ChangeViewModeUseCase {
  constructor(private readonly repository: IEntityRepository<Profile>) {}

  execute(viewMode: ViewMode): AsyncResult<Profile> {
    return updateEntity(this.repository, (profile) => ok({ ...profile, viewMode }));
  }
}

// Sesleri açar/kapatır; tercih kalıcı olarak saklanır
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

// Kullanıcının hitap adını değiştirir
export class UpdateUserNameUseCase {
  constructor(private readonly repository: IEntityRepository<Profile>) {}

  async execute(name: string): AsyncResult<Profile> {
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > PROFILE_NAME_MAX_LENGTH) {
      return err(new ValidationFailure('İsim 1-30 karakter arasında olmalı.'));
    }
    return updateEntity(this.repository, (profile) => ok({ ...profile, name: trimmed }));
  }
}
