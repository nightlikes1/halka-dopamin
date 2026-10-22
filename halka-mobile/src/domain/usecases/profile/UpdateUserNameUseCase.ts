// Kullanıcının hitap adını değiştirir
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type AsyncResult } from '@core/result/Result';
import { PROFILE_NAME_MAX_LENGTH, type Profile } from '@domain/entities/Profile';
import type { IProfileRepository } from '@domain/repositories/IProfileRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class UpdateUserNameUseCase {
  constructor(private readonly repository: IProfileRepository) {}

  async execute(name: string): AsyncResult<Profile> {
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > PROFILE_NAME_MAX_LENGTH) {
      return err(new ValidationFailure('İsim 1-30 karakter arasında olmalı.'));
    }
    return updateEntity(this.repository, (profile) => ok({ ...profile, name: trimmed }));
  }
}
