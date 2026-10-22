// Günün kısa hissini kaydeder
import { ok, type AsyncResult } from '@core/result/Result';
import { REFLECTION_MAX_LENGTH, type Mood } from '@domain/entities/Mood';
import type { IMoodRepository } from '@domain/repositories/IMoodRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class SetReflectionUseCase {
  constructor(private readonly repository: IMoodRepository) {}

  execute(reflection: string): AsyncResult<Mood> {
    const value = reflection.trim().slice(0, REFLECTION_MAX_LENGTH);
    return updateEntity(this.repository, (mood) => ok({ ...mood, reflection: value }));
  }
}
