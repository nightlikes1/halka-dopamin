// Ruh hali, enerji ve günlük düşünce
import { type AsyncResult, ok } from '@core/result/Result';
import { clamp } from '@core/utils/format';
import {
  ENERGY_MAX,
  ENERGY_MIN,
  type Mood,
  type MoodId,
  REFLECTION_MAX_LENGTH,
} from '@features/halka/domain/entities/Mood';
import type { IEntityRepository } from '@features/halka/domain/ports';
import { updateEntity } from '@features/halka/domain/usecases/updateEntity';

// Enerji seviyesini (1-10) kaydeder
export class SetEnergyLevelUseCase {
  constructor(private readonly repository: IEntityRepository<Mood>) {}

  execute(level: number): AsyncResult<Mood> {
    const energyLevel = clamp(Math.round(level), ENERGY_MIN, ENERGY_MAX);
    return updateEntity(this.repository, (mood) => ok({ ...mood, energyLevel }));
  }
}

// Günün duygu durumunu seçer
export class SetMoodUseCase {
  constructor(private readonly repository: IEntityRepository<Mood>) {}

  execute(moodId: MoodId): AsyncResult<Mood> {
    return updateEntity(this.repository, (mood) => ok({ ...mood, todayMood: moodId }));
  }
}

// Günün kısa hissini kaydeder
export class SetReflectionUseCase {
  constructor(private readonly repository: IEntityRepository<Mood>) {}

  execute(reflection: string): AsyncResult<Mood> {
    const value = reflection.trim().slice(0, REFLECTION_MAX_LENGTH);
    return updateEntity(this.repository, (mood) => ok({ ...mood, reflection: value }));
  }
}
