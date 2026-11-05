// Kokpit / Panel görünüm modunu değiştirir
import { ok, type AsyncResult } from '@core/result/Result';
import type { Profile, ViewMode } from '@domain/entities/Profile';
import type { IEntityRepository } from '@domain/ports';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class ChangeViewModeUseCase {
  constructor(private readonly repository: IEntityRepository<Profile>) {}

  execute(viewMode: ViewMode): AsyncResult<Profile> {
    return updateEntity(this.repository, (profile) => ok({ ...profile, viewMode }));
  }
}
