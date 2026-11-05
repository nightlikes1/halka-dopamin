// Notu temizler
import { ok, type AsyncResult } from '@core/result/Result';
import type { Note } from '@domain/entities/Note';
import type { IEntityRepository } from '@domain/ports';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class ClearNoteUseCase {
  constructor(private readonly repository: IEntityRepository<Note>) {}

  execute(): AsyncResult<Note> {
    return updateEntity(this.repository, (note) => ok({ ...note, content: '' }));
  }
}
