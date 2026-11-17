// Sakin saat: süre seçenekleri ve kalan süre hesabı (saf)
export const CALM_MINUTES = [15, 30, 60] as const;
export type CalmMinutes = (typeof CALM_MINUTES)[number];

// Kalan saniye (0'ın altına inmez)
export function calmRemainingSeconds(startedAt: number, minutes: number, now: number): number {
  return Math.max(0, Math.ceil((startedAt + minutes * 60_000 - now) / 1000));
}
