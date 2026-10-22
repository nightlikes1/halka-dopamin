// Günlük dopamin dengesi skoru (saf fonksiyonlar)
//
// günlükDenge = 100 × ( 0,4·edinilecekOranı + 0,4·bırakılacakOranı + 0,2·(puan−1)/4 )
// Cevaplanmamış grup (ör. hiç kötü alışkanlık yoksa) hesaba katılmaz; ağırlığı diğerlerine dağılır.
// Faz 1'de aktivite süreleri ek bileşen olarak girecek.
import type { CheckInInput, HabitCheck } from '@features/checkin/domain/entities';

export const BALANCE_WEIGHTS = { build: 0.4, quit: 0.4, rating: 0.2 } as const;

export interface DailyBalance {
  readonly score: number; // 0-100 (tam sayı)
  readonly buildRatio: number | null; // yapılan / cevaplanan iyi alışkanlık
  readonly quitRatio: number | null; // uzak durulan / cevaplanan kötü alışkanlık
  readonly ratingRatio: number; // (puan-1)/4
}

const ratio = (positive: number, total: number): number | null =>
  total === 0 ? null : positive / total;

function countBy(entries: readonly HabitCheck[]) {
  let done = 0;
  let missed = 0;
  let clean = 0;
  let slip = 0;
  for (const { status } of entries) {
    if (status === 'done') done += 1;
    else if (status === 'missed') missed += 1;
    else if (status === 'clean') clean += 1;
    else slip += 1;
  }
  return { done, missed, clean, slip };
}

export function computeDailyBalance(input: CheckInInput): DailyBalance {
  const { done, missed, clean, slip } = countBy(input.entries);
  const buildRatio = ratio(done, done + missed);
  const quitRatio = ratio(clean, clean + slip);
  const ratingRatio = Math.min(1, Math.max(0, (input.rating - 1) / 4));

  const parts: { weight: number; value: number }[] = [
    { weight: BALANCE_WEIGHTS.rating, value: ratingRatio },
  ];
  if (buildRatio !== null) parts.push({ weight: BALANCE_WEIGHTS.build, value: buildRatio });
  if (quitRatio !== null) parts.push({ weight: BALANCE_WEIGHTS.quit, value: quitRatio });

  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
  const weighted = parts.reduce((sum, part) => sum + part.weight * part.value, 0);

  return {
    score: Math.round((weighted / totalWeight) * 100),
    buildRatio,
    quitRatio,
    ratingRatio,
  };
}

export const TROUBLED_RATING_MAX = 2;

// Hatalı gün: yapılmayan iyi alışkanlık, kayma ya da düşük puan
export function isTroubledDay(input: CheckInInput): boolean {
  return (
    input.rating <= TROUBLED_RATING_MAX ||
    input.entries.some((entry) => entry.status === 'missed' || entry.status === 'slip')
  );
}
