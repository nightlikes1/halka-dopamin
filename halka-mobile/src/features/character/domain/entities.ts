// Potansiyel Karakterim: "olmak istediğim kişi" ve onu oluşturan özellikler
import type { DiceBearAvatar } from '@features/character/domain/dicebear';
import type { AvatarLook } from '@features/character/domain/look';

export const IDENTITY_MAX_LENGTH = 60;
export const TRAIT_NAME_MAX_LENGTH = 30;
export const MIN_TRAITS = 1;
export const MAX_TRAITS = 5;

// Parçacık avatar: biçim ve palet (sunucuyla aynı adlar)
export const AVATAR_SHAPES = ['orbit', 'flower', 'crystal'] as const;
export type AvatarShape = (typeof AVATAR_SHAPES)[number];
export const AVATAR_PALETTES = ['buzAtes', 'ates', 'buz', 'mor'] as const;
export type AvatarPalette = (typeof AVATAR_PALETTES)[number];

export interface CharacterAvatar {
  readonly shape: AvatarShape;
  readonly palette: AvatarPalette;
}

export interface Trait {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  // Aynı alışkanlık birden çok özelliğe bağlanabilir
  readonly habitIds: readonly string[];
}

export interface Character {
  readonly id: string;
  readonly identity: string; // "Olmak istediğim kişi…" cümlesi
  readonly createdAt: string;
  // null: kullanıcı seçmedi, karakterden otomatik üretilir (resolveAvatar)
  readonly avatar: CharacterAvatar | null;
  // Çizgi karakter görünümü; null: karakterden otomatik (resolveLook)
  readonly look: AvatarLook | null;
  // DiceBear avatarı; null: kendi çizgi karakterimiz (look) gösterilir
  readonly dicebear: DiceBearAvatar | null;
  readonly traits: readonly Trait[];
}

// Kurulum/düzenleme taslağı (id yoksa yeni özellik)
export interface TraitDraft {
  readonly id?: string;
  readonly name: string;
  readonly habitIds: readonly string[];
}

export interface CharacterDraft {
  readonly identity: string;
  readonly traits: readonly TraitDraft[];
  // Verilmezse sunucudaki ayar korunur; null otomatiğe döndürür
  readonly avatar?: CharacterAvatar | null;
  readonly look?: AvatarLook | null;
  readonly dicebear?: DiceBearAvatar | null;
}
