// Eğitim rehberi içerik şeması (Faz 3'te JSON dosyalarından okunacak)
import type { HabitKind, HabitTarget } from '@features/habits/domain/entities';

export type GuideCategory =
  'health' | 'mind' | 'learning' | 'creativity' | 'productivity' | 'digital-wellbeing';

export interface GuideWeek {
  readonly title: string;
  readonly steps: readonly string[];
}

export interface SuggestedHabit {
  readonly kind: HabitKind;
  readonly title: string;
  readonly traitKeys: readonly string[];
  readonly target: HabitTarget;
}

export interface Guide {
  readonly id: string;
  readonly title: string;
  readonly category: GuideCategory;
  readonly traitKeys: readonly string[];
  // Eşleştirme için anahtar kelimeler ve eş anlamlılar
  readonly keywords: readonly string[];
  // true ise sağlık uyarısı ve uzman yönlendirmesi gösterilir
  readonly healthSensitive: boolean;
  readonly why: string;
  readonly firstStep: string;
  readonly weeks: readonly [GuideWeek, GuideWeek, GuideWeek, GuideWeek];
  readonly levels: {
    readonly beginner: readonly string[];
    readonly intermediate: readonly string[];
    readonly advanced: readonly string[];
  };
  readonly commonMistakes: readonly string[];
  readonly motivationTips: readonly string[];
  readonly suggestedHabits: readonly SuggestedHabit[];
}

export interface GuideMatch {
  readonly guide: Guide;
  readonly score: number; // 0-1
}
