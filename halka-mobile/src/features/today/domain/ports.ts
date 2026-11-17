// Bugün özelliğinin repository sözleşmeleri
import type { AsyncResult } from '@core/result/Result';
import type { Circle, TodayLocalState, UrgeLog } from '@features/today/domain/entities';

// Cihazdaki dürtü / mini hal / not kayıtları (implementasyon: AsyncStorage)
export interface TodayLocalRepository {
  read(): AsyncResult<TodayLocalState>;
  addUrge(urge: UrgeLog): AsyncResult<void>;
  setMini(date: string, habitId: string, on: boolean): AsyncResult<void>;
  setSelfNote(note: string | null): AsyncResult<void>;
  markCelebrated(date: string): AsyncResult<void>;
}

// Çember (implementasyon şimdilik örnek veri)
export interface CircleRepository {
  get(): AsyncResult<Circle | null>;
}
