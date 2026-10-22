// Notu panoya kopyalar
import { ValidationFailure } from '@core/errors/Failure';
import { err, type AsyncResult } from '@core/result/Result';
import type { ClipboardPort } from '@domain/ports/ClipboardPort';

export class CopyNoteUseCase {
  constructor(private readonly clipboard: ClipboardPort) {}

  async execute(content: string): AsyncResult<void> {
    if (content.trim().length === 0) {
      return err(new ValidationFailure('Kopyalanacak not yok.'));
    }
    return this.clipboard.copyText(content);
  }
}
