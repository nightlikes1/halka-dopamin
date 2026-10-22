// Not içeriğini kaydeder
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type AsyncResult } from '@core/result/Result';
import { NOTE_MAX_LENGTH, type Note } from '@domain/entities/Note';
import type { INotesRepository } from '@domain/repositories/INotesRepository';
import { updateEntity } from '@domain/usecases/shared/updateEntity';

export class UpdateNoteUseCase {
  constructor(private readonly repository: INotesRepository) {}

  async execute(content: string): AsyncResult<Note> {
    if (content.length > NOTE_MAX_LENGTH) {
      return err(new ValidationFailure('Not çok uzun.'));
    }
    return updateEntity(this.repository, (note) => ok({ ...note, content }));
  }
}
