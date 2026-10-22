// Gün notu repository sözleşmesi (implementasyon: HTTP API)
import type { AsyncResult } from '@core/result/Result';
import type { DayNote } from '@features/history/domain/entities';

export interface DayNoteRepository {
  listRange(from: string, to: string): AsyncResult<readonly DayNote[]>;
  save(date: string, text: string): AsyncResult<DayNote>;
  delete(date: string): AsyncResult<void>;
}
