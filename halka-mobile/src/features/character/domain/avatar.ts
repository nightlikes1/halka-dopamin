// Parçacık avatarın karakterden türetilmesi (saf fonksiyonlar).
// Kullanıcı biçim/palet seçmediyse kimlik cümlesi ve özellik adlarından kararlı bir seçim yapılır;
// aynı karakter her açılışta aynı avatarı görür.
import {
  AVATAR_PALETTES,
  AVATAR_SHAPES,
  type CharacterAvatar,
} from '@features/character/domain/entities';
import { deriveLook, type AvatarLook } from '@features/character/domain/look';

// Kaydedilmiş karakter ya da kurulum taslağı (özellik kimliği gerekmez)
export interface AvatarSource {
  readonly identity: string;
  readonly traits: readonly { readonly name: string }[];
  readonly avatar?: CharacterAvatar | null;
  readonly look?: AvatarLook | null;
}

// FNV-1a 32 bit: kısa metinler için hızlı ve kararlı karma
export function avatarSeed(identity: string, traitNames: readonly string[]): number {
  const text = [identity.trim().toLocaleLowerCase('tr'), ...traitNames].join('|');
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export function deriveAvatar(seed: number): CharacterAvatar {
  return {
    shape: AVATAR_SHAPES[seed % AVATAR_SHAPES.length] ?? 'orbit',
    palette: AVATAR_PALETTES[(seed >>> 8) % AVATAR_PALETTES.length] ?? 'buzAtes',
  };
}

// Gösterilecek avatar: kullanıcının seçimi, yoksa karakterden türetilen
export function resolveAvatar(character: AvatarSource): CharacterAvatar {
  if (character.avatar) return character.avatar;
  return deriveAvatar(
    avatarSeed(
      character.identity,
      character.traits.map((trait) => trait.name),
    ),
  );
}

const seedOf = (source: AvatarSource) =>
  avatarSeed(
    source.identity,
    source.traits.map((trait) => trait.name),
  );

// Gösterilecek çizgi karakter: kullanıcının düzenlediği, yoksa karakterden türetilen
export function resolveLook(source: AvatarSource): AvatarLook {
  return source.look ?? deriveLook(seedOf(source));
}
