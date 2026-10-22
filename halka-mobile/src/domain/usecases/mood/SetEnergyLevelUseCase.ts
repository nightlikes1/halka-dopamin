// Enerji seviyesini (1-10) kaydeder
import { ok, type AsyncResult } from '@core/result/Result';
import { clamp } from '@core/utils/format';
import { ENERGY_MAX, ENERGY_MIN, type Mood } from '@domain/entities/Mood';
import type { IMoodRepository } from '@domain/repositories/IMoodRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class SetEnergyLevelUseCase {
  constructor(private readonly repository: IMoodRepository) {}

  execute(level: number): AsyncResult<Mood> {
    const energyLevel = clamp(Math.round(level), ENERGY_MIN, ENERGY_MAX);
    return updateEntity(this.repository, (mood) => ok({ ...mood, energyLevel }));
  }
}
