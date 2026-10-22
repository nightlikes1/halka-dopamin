// Biçimlendirme yardımcıları
import { padTwo } from '@core/utils/date';

// Saniye -> "MM:SS"
export function formatMinutesSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return `${padTwo(Math.floor(safe / 60))}:${padTwo(safe % 60)}`;
}

// Tutar -> "120 ₺" / "12.50 ₺"
export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)} ₺`;
}

// Değeri [min, max] aralığına sıkıştırır
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
