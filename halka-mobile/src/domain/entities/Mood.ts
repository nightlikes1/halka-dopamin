// Ruh hali ve enerji seviyesi

export const MOOD_IDS = ['great', 'energetic', 'calm', 'tired', 'low'] as const;
export type MoodId = (typeof MOOD_IDS)[number];

export interface MoodOption {
  readonly id: MoodId;
  readonly icon: string;
  readonly label: string;
}

export const MOOD_OPTIONS: readonly MoodOption[] = [
  { id: 'great', icon: '🤩', label: 'Harika' },
  { id: 'energetic', icon: '⚡', label: 'Enerjik' },
  { id: 'calm', icon: '🧘', label: 'Sakin' },
  { id: 'tired', icon: '🥱', label: 'Yorgun' },
  { id: 'low', icon: '🌧️', label: 'Düşük' },
];

export interface Mood {
  readonly todayMood: MoodId;
  readonly energyLevel: number; // 1-10
  readonly reflection: string;
}

export const ENERGY_MIN = 1;
export const ENERGY_MAX = 10;
export const REFLECTION_MAX_LENGTH = 140;

export function isMoodId(value: string): value is MoodId {
  return (MOOD_IDS as readonly string[]).includes(value);
}

export function getMoodOption(id: MoodId): MoodOption {
  return MOOD_OPTIONS.find((option) => option.id === id) ?? { id, icon: '🌟', label: 'Mod' };
}
