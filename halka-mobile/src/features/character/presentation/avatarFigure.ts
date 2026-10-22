// Karakteri avatar figürüne çevirir: parçacık aura (seçilmiş ya da türetilmiş biçim + palet)
import { avatarSeed, resolveAvatar, type AvatarSource } from '@features/character/domain/avatar';
import type { DiceBearStyleId } from '@features/character/domain/dicebear';
import type { CharacterAvatar } from '@features/character/domain/entities';
import { deriveLook } from '@features/character/domain/look';
import type { AvatarFigure } from '@features/character/presentation/components/AvatarBadge';

// Karakter yokken (tanıtım) gösterilen figür ve görünüm
export const INTRO_FIGURE: AvatarFigure = {
  shape: 'orbit',
  palette: 'buzAtes',
  layers: 3,
  seed: 7,
};
export const INTRO_LOOK = deriveLook(7);

// DiceBear tohumu: karakterden kararlı; "Baş harfler" stili harfleri kimlik cümlesinden alır
export function diceBearSeedFor(character: AvatarSource, style: DiceBearStyleId): string {
  if (style === 'initials') return character.identity.trim() || 'Halka';
  return String(
    avatarSeed(
      character.identity,
      character.traits.map((trait) => trait.name),
    ),
  );
}

export function figureFor(
  character: AvatarSource,
  override?: CharacterAvatar | null,
): AvatarFigure {
  const avatar = override ?? resolveAvatar(character);
  return {
    shape: avatar.shape,
    palette: avatar.palette,
    layers: Math.max(1, character.traits.length),
    seed: avatarSeed(
      character.identity,
      character.traits.map((trait) => trait.name),
    ),
  };
}
