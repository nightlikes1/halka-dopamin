// Karakter repository sözleşmesi (implementasyon: HTTP API; ileride başka bir arka uca taşınabilir)
import type { AsyncResult } from '@core/result/Result';
import type { Character, CharacterDraft } from '@features/character/domain/entities';

export interface CharacterRepository {
  get(): AsyncResult<Character | null>;
  // Oluşturur ya da düzenler; gönderilmeyen özellikler silinir
  save(draft: CharacterDraft): AsyncResult<Character>;
  // Yalnızca karakter silinir; alışkanlıklar ve check-in geçmişi korunur
  delete(): AsyncResult<void>;
}
