// Edinilecek (build) / bırakılacak (quit) alışkanlık varlıkları

export type HabitKind = 'quit' | 'build';

export type HabitTarget =
  | { readonly type: 'daily' }
  | { readonly type: 'weeklyCount'; readonly count: number }
  | { readonly type: 'dailyAmount'; readonly amount: number; readonly unit: string };

// Faz 2'de özellik bağlantıları (traitIds) ve rehber kaynağı eklenecek
export interface Habit {
  readonly id: string;
  readonly kind: HabitKind;
  readonly title: string;
  readonly target: HabitTarget;
  readonly createdAt: string;
}

export interface CreateHabitInput {
  readonly kind: HabitKind;
  readonly title: string;
}

// done/missed: edinilecek alışkanlık · clean/slip: bırakılacak alışkanlık
export type HabitEntryStatus = 'done' | 'missed' | 'clean' | 'slip';

export const STATUSES_BY_KIND: Readonly<Record<HabitKind, readonly HabitEntryStatus[]>> = {
  build: ['done', 'missed'],
  quit: ['clean', 'slip'],
};

// Cevaptan alışkanlık türü çıkarılabilir (arşivlenmiş alışkanlıklar için de geçerli)
export const kindOfStatus = (status: HabitEntryStatus): HabitKind =>
  status === 'done' || status === 'missed' ? 'build' : 'quit';

export const HABIT_TITLE_MAX_LENGTH = 80;

// Aynı ad (büyük/küçük harf ve kenar boşluğu farkı gözetmeden) ikinci kez eklenemez
export const sameHabitTitle = (a: string, b: string): boolean =>
  a.trim().toLocaleLowerCase('tr') === b.trim().toLocaleLowerCase('tr');
