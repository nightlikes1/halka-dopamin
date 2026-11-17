// Bugün ekranı varlıkları: dürtü kaydı ("Canım çekiyor"), mini hal işaretleri, kendine not ve Çember.
// Dürtü, mini hal ve not şimdilik cihazda tutulur; Çember örnek veridir (sunucu fazında gerçeğe bağlanır).

export type UrgeKind = 'social' | 'snack' | 'video' | 'shopping' | 'smoking' | 'other';

export const URGE_KINDS: readonly UrgeKind[] = [
  'social',
  'snack',
  'video',
  'shopping',
  'smoking',
  'other',
];

// geçti / hâlâ çekiyor / yaptım
export type UrgeOutcome = 'passed' | 'still' | 'did';

export interface UrgeLog {
  readonly id: string;
  readonly kind: UrgeKind;
  readonly outcome: UrgeOutcome;
  readonly date: string; // YYYY-MM-DD (yerel)
  readonly at: string; // ISO zaman
}

export const SELF_NOTE_MAX_LENGTH = 160;

export interface TodayLocalState {
  readonly urges: readonly UrgeLog[];
  // Gün → mini hali yapılan alışkanlık kimlikleri
  readonly minis: Readonly<Record<string, readonly string[]>>;
  readonly selfNote: string | null;
  // Gün tamam kutlamasının gösterildiği son gün (günde bir kez)
  readonly celebratedOn: string | null;
}

export const EMPTY_TODAY_STATE: TodayLocalState = {
  urges: [],
  minis: {},
  selfNote: null,
  celebratedOn: null,
};

// Çember: görünen tek şey gün durumu (yüzde, sıralama yok)
export type CircleStatus = 'balanced' | 'struggling' | 'quiet';

export interface CircleMember {
  readonly id: string;
  readonly name: string;
  readonly status: CircleStatus;
  // Zorlanıyorsa kaç gündür
  readonly struggleDays?: number;
}

export interface Circle {
  readonly name: string;
  readonly members: readonly CircleMember[];
}
