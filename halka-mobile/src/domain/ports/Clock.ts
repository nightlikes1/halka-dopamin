// Zaman kaynağı (testlerde sabitlenebilir)
import { toIsoDate } from '@core/utils/date';

export interface Clock {
  now(): Date;
}

export function todayOf(clock: Clock): string {
  return toIsoDate(clock.now());
}
