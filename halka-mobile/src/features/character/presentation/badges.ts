// Karakter rozetleri: mevcut verilerden türetilen kilometre taşları (XP modeli yok).
// Eşikler burada; rozet açıldı mı hesabı saf fonksiyon.
import type { IconName } from '@presentation/components/common/Icon';

export type BadgeId = 'firstCheckIn' | 'streak7' | 'fullWeek' | 'proximity80';

export interface BadgeState {
  readonly id: BadgeId;
  readonly icon: IconName;
  readonly unlocked: boolean;
}

export const STREAK_BADGE_DAYS = 7;
export const PROXIMITY_BADGE = 80;
const WEEK_DAYS = 7;

export function computeBadges(input: {
  // Son 30 günde en az bir kayıtlı gün var mı
  readonly hasAnyRecord: boolean;
  // Son 7 günde kayıtlı gün sayısı
  readonly recordedThisWeek: number;
  // Halka "Zinciri Kırma" serisi
  readonly streakDays: number;
  readonly proximity: number | null;
}): readonly BadgeState[] {
  return [
    { id: 'firstCheckIn', icon: 'check', unlocked: input.hasAnyRecord },
    {
      id: 'streak7',
      icon: 'flame',
      unlocked: input.streakDays >= STREAK_BADGE_DAYS,
    },
    {
      id: 'fullWeek',
      icon: 'calendar',
      unlocked: input.recordedThisWeek >= WEEK_DAYS,
    },
    {
      id: 'proximity80',
      icon: 'award',
      unlocked: input.proximity !== null && input.proximity >= PROXIMITY_BADGE,
    },
  ];
}
