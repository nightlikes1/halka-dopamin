// Kokpit / Panel görünüm modunu değiştirir
import { ok, type AsyncResult } from '@core/result/Result';
import type { Profile, ViewMode } from '@domain/entities/Profile';
import type { IProfileRepository } from '@domain/repositories/IProfileRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class ChangeViewModeUseCase {
  constructor(private readonly repository: IProfileRepository) {}

  execute(viewMode: ViewMode): AsyncResult<Profile> {
    return updateEntity(this.repository, (profile) => ok({ ...profile, viewMode }));
  }
}
