// Gelişim özelliğinin repository sözleşmeleri
import type { AsyncResult } from '@core/result/Result';
import type { DailyLog } from '@features/stats/domain/entities';

// Cihazdaki günlük özetler (implementasyon: AsyncStorage)
export interface DailyLogRepository {
  list(): AsyncResult<readonly DailyLog[]>;
  // Aynı gün için tekrar çağrılırsa üzerine yazar; eski günler budanır
  upsert(log: DailyLog): AsyncResult<void>;
}
