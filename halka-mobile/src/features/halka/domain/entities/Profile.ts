// Kullanıcı profili ve görünüm tercihleri

export const VIEW_MODES = ['cockpit', 'grid'] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

export interface Profile {
  readonly name: string;
  readonly title: string;
  readonly viewMode: ViewMode;
  readonly soundEnabled: boolean;
  // Günlük sıfırlamanın en son çalıştığı gün (YYYY-MM-DD)
  readonly lastActiveDate: string;
}

export const PROFILE_NAME_MAX_LENGTH = 30;
export const PROFILE_FALLBACK_NAME = 'Dostum';
// İlk kurulumdaki örnek ad (defaults.ts); kullanıcı değiştirmediyse hesap adı tercih edilir
export const PROFILE_DEFAULT_NAME = 'Kullanıcı';

// Hitap adı (Bugün ve Halka aynı kuralı kullanır): Halka'da değiştirilmiş ad > hesap adı > profil adı
export function resolveGreetingName(
  accountName: string | null | undefined,
  profileName: string,
): string {
  const own = profileName.trim();
  if (own.length > 0 && own !== PROFILE_DEFAULT_NAME && own !== PROFILE_FALLBACK_NAME) return own;
  return accountName?.trim() || own;
}
