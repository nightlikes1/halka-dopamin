// Not defteri
import { ValidationFailure } from '@core/errors/Failure';
import { type AsyncResult, err, ok } from '@core/result/Result';
import { type Note, NOTE_MAX_LENGTH } from '@domain/entities/Note';
import type { ClipboardPort, IEntityRepository } from '@domain/ports';
import { updateEntity } from '@domain/usecases/updateEntity';

// Notu temizler
export class ClearNoteUseCase {
  constructor(private readonly repository: IEntityRepository<Note>) {}

  execute(): AsyncResult<Note> {
    return updateEntity(this.repository, (note) => ok({ ...note, content: '' }));
  }
}

// Notu panoya kopyalar
export class CopyNoteUseCase {
  constructor(private readonly clipboard: ClipboardPort) {}

  async execute(content: string): AsyncResult<void> {
    if (content.trim().length === 0) {
      return err(new ValidationFailure('Kopyalanacak not yok.'));
    }
    return this.clipboard.copyText(content);
  }
}

// Not içeriğini kaydeder
export class UpdateNoteUseCase {
  constructor(private readonly repository: IEntityRepository<Note>) {}

  async execute(content: string): AsyncResult<Note> {
    if (content.length > NOTE_MAX_LENGTH) {
      return err(new ValidationFailure('Not çok uzun.'));
    }
    return updateEntity(this.repository, (note) => ok({ ...note, content }));
  }
}
