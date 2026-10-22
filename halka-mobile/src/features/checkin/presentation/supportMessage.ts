// Skora göre destekleyici mesaj: yüksek skorlu günde "yarın yeni bir gün" gibi çelişkili metin çıkmaz
import { strings } from '@core/i18n/tr';

const t = strings.checkIn;

export const LOW_SCORE_LIMIT = 40;
export const GOOD_SCORE_LIMIT = 70;

export function supportMessage(score: number, troubled: boolean): string {
  if (score < LOW_SCORE_LIMIT) return t.troubledSupport;
  if (score < GOOD_SCORE_LIMIT) return t.midDay;
  return troubled ? t.goodDayWithSlip : t.goodDay;
}
