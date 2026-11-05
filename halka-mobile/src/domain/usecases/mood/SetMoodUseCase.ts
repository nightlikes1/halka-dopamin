// Günün duygu durumunu seçer
import { ok, type AsyncResult } from '@core/result/Result';
import type { Mood, MoodId } from '@domain/entities/Mood';
import type { IEntityRepository } from '@domain/ports';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class SetMoodUseCase {
  constructor(private readonly repository: IEntityRepository<Mood>) {}

  execute(moodId: MoodId): AsyncResult<Mood> {
    return updateEntity(this.repository, (mood) => ok({ ...mood, todayMood: moodId }));
  }
}
