// Saat kaynağı: tüm özellikler kullanır
import { toIsoDate } from '@core/utils/date';

// Zaman kaynağı (testlerde sabitlenebilir)
export interface Clock {
  now(): Date;
}

export function todayOf(clock: Clock): string {
  return toIsoDate(clock.now());
}

// Sistem saatini kullanan Clock uygulaması
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
