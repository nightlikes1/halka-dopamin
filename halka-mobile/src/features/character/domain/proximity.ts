// Karaktere yakınlık hesabı (saf fonksiyonlar; UI ve depolamadan bağımsız).
//
// Tek doğruluk kaynağı akşam check-in'deki alışkanlık cevaplarıdır; değerler saklanmaz.
// - Özellik ilerlemesi (gün) = o gün yapılan bağlı alışkanlık / o gün cevaplanan bağlı alışkanlık.
//   O gün cevaplanan bağlı alışkanlık yoksa (check-in yok, bağ yok, hepsi boş) özellik o güne katılmaz.
// - Günlük yakınlık = katılan özelliklerin ortalaması (0-100). Hiçbiri katılmıyorsa gün "kayıt yok".
// - Check-in puanı varsa günlük yakınlığa en fazla CHECKIN_WEIGHT ağırlıkla katkı yapar.
// - Gösterilen yakınlık = son 7 gündeki kayıtlı günlerin ortalaması.
import { addDays } from '@core/utils/date';
import type { DailyCheckIn } from '@features/checkin/domain/entities';
import type { HabitEntryStatus } from '@features/habits/domain/entities';
import type { Trait } from '@features/character/domain/entities';

// Check-in puanının günlük yakınlıktaki ağırlığı (en fazla %20)
export const CHECKIN_WEIGHT = 0.2;
export const PROXIMITY_WINDOW_DAYS = 7;

export interface DayValue {
  readonly date: string;
  readonly value: number | null; // 0-100; null = o gün için kayıt yok
}

export interface TraitDayStatus {
  readonly linked: number; // bağlı alışkanlık sayısı
  readonly answered: number; // o gün cevaplanan
  readonly done: number; // o gün yapılan (iyi: yaptım, kötü: uzak durdum)
}

const isPositive = (status: HabitEntryStatus): boolean => status === 'done' || status === 'clean';

export function traitDayStatus(
  habitIds: readonly string[],
  checkIn: DailyCheckIn | undefined,
): TraitDayStatus {
  const unique = [...new Set(habitIds)];
  if (!checkIn) return { linked: unique.length, answered: 0, done: 0 };
  const statusById = new Map(checkIn.entries.map((entry) => [entry.habitId, entry.status]));
  let answered = 0;
  let done = 0;
  for (const id of unique) {
    const status = statusById.get(id);
    if (!status) continue;
    answered += 1;
    if (isPositive(status)) done += 1;
  }
  return { linked: unique.length, answered, done };
}

// 0-1 arası; o gün cevaplanan bağlı alışkanlık yoksa null
export function traitDayProgress(
  habitIds: readonly string[],
  checkIn: DailyCheckIn | undefined,
): number | null {
  const { answered, done } = traitDayStatus(habitIds, checkIn);
  return answered === 0 ? null : done / answered;
}

export function averageOf(values: readonly (number | null)[]): number | null {
  const known = values.filter((value): value is number => value !== null);
  return known.length === 0 ? null : known.reduce((sum, value) => sum + value, 0) / known.length;
}

// Günün yakınlığı (0-100) ya da kayıt yoksa null
export function dailyProximity(
  traits: readonly Trait[],
  checkIn: DailyCheckIn | undefined,
): number | null {
  const traitAverage = averageOf(traits.map((trait) => traitDayProgress(trait.habitIds, checkIn)));
  if (traitAverage === null || !checkIn) return null;
  const ratingShare = (checkIn.rating - 1) / 4;
  return ((1 - CHECKIN_WEIGHT) * traitAverage + CHECKIN_WEIGHT * ratingShare) * 100;
}

// endDate dahil geriye doğru `days` günlük tarih listesi (eskiden yeniye)
export function lastDays(endDate: string, days: number): string[] {
  return Array.from({ length: days }, (_, index) => addDays(endDate, index - days + 1));
}

const byDate = (checkIns: readonly DailyCheckIn[]) =>
  new Map(checkIns.map((checkIn) => [checkIn.date, checkIn]));

export function proximitySeries(
  traits: readonly Trait[],
  checkIns: readonly DailyCheckIn[],
  endDate: string,
  days: number,
): DayValue[] {
  const map = byDate(checkIns);
  return lastDays(endDate, days).map((date) => ({
    date,
    value: dailyProximity(traits, map.get(date)),
  }));
}

// Bir özelliğin günlük ilerleme serisi (0-100)
export function traitSeries(
  trait: Trait,
  checkIns: readonly DailyCheckIn[],
  endDate: string,
  days: number,
): DayValue[] {
  const map = byDate(checkIns);
  return lastDays(endDate, days).map((date) => {
    const progress = traitDayProgress(trait.habitIds, map.get(date));
    return { date, value: progress === null ? null : progress * 100 };
  });
}

// Gösterilen yakınlık: pencere içindeki kayıtlı günlerin ortalaması
export function displayedProximity(series: readonly DayValue[]): number | null {
  return averageOf(series.slice(-PROXIMITY_WINDOW_DAYS).map((day) => day.value));
}

// Silinmiş/arşivlenmiş alışkanlık bağlarını hesaptan çıkarır
export function withKnownHabits(trait: Trait, knownHabitIds: ReadonlySet<string>): Trait {
  return { ...trait, habitIds: trait.habitIds.filter((id) => knownHabitIds.has(id)) };
}
