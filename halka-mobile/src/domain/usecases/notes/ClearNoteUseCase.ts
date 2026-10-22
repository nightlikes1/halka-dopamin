// Notu temizler
import { ok, type AsyncResult } from '@core/result/Result';
import type { Note } from '@domain/entities/Note';
import type { INotesRepository } from '@domain/repositories/INotesRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class ClearNoteUseCase {
  constructor(private readonly repository: INotesRepository) {}

  execute(): AsyncResult<Note> {
    return updateEntity(this.repository, (note) => ok({ ...note, content: '' }));
  }
}
