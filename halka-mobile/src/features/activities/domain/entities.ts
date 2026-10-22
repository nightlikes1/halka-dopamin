// Aktivite takibi varlıkları (Faz 1'de kullanılacak)

export type DopamineCategory = 'cheap' | 'quality' | 'neutral';

export type MoodScore = 1 | 2 | 3 | 4 | 5;

export interface ActivityDefinition {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly category: DopamineCategory;
  // Tek dokunuşla eklemede kullanılan süre (dk)
  readonly defaultMinutes: number;
  readonly isCustom: boolean;
  readonly isFavorite: boolean;
  // Silinen aktivite arşivlenir; geçmiş kayıtlar bozulmaz
  readonly archivedAt: string | null;
}

export type LogSource = 'quick' | 'timer' | 'manual';

export interface ActivityLog {
  readonly id: string;
  readonly activityId: string;
  readonly startedAt: string; // ISO, UTC
  readonly endedAt: string;
  readonly source: LogSource;
  readonly moodBefore: MoodScore | null;
  readonly moodAfter: MoodScore | null;
  readonly note: string;
}

// Kullanıcı başına en fazla bir çalışan sayaç; süre başlangıç zamanından hesaplanır
export interface RunningTimer {
  readonly activityId: string;
  readonly startedAt: string;
  readonly moodBefore: MoodScore | null;
}

// Gece yarısını geçen kayıtlar yerel güne göre parçalara bölünür
export interface DaySegment {
  readonly date: string; // YYYY-MM-DD (yerel)
  readonly activityId: string;
  readonly category: DopamineCategory;
  readonly minutes: number;
}

// Zaman tasarrufu referansı
export type BaselineScope =
  { readonly type: 'total' } | { readonly type: 'activity'; readonly activityId: string };

export interface Baseline {
  readonly id: string;
  readonly scope: BaselineScope;
  readonly dailyMinutes: number;
  // Değiştiğinde geçmiş hesaplar bozulmasın diye geçerlilik tarihi tutulur
  readonly effectiveFrom: string;
}
