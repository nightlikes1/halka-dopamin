// Karakter taslağı doğrulama (saf fonksiyon)
import { ValidationFailure } from '@core/errors/Failure';
import { err, ok, type Result } from '@core/result/Result';
import {
  AVATAR_PALETTES,
  AVATAR_SHAPES,
  IDENTITY_MAX_LENGTH,
  MAX_TRAITS,
  MIN_TRAITS,
  TRAIT_NAME_MAX_LENGTH,
  type CharacterDraft,
} from '@features/character/domain/entities';
import { isValidDiceBear } from '@features/character/domain/dicebear';
import { isValidLook } from '@features/character/domain/look';

const invalid = (message: string) => err(new ValidationFailure(message));

// Metinleri kırpar, tekrar eden bağları atar; kurallara uymuyorsa anlaşılır hata döner
export function normalizeCharacterDraft(draft: CharacterDraft): Result<CharacterDraft> {
  const identity = draft.identity.trim();
  if (identity.length === 0) return invalid('Olmak istediğin kişiyi bir cümleyle anlat.');
  if (identity.length > IDENTITY_MAX_LENGTH) {
    return invalid(`Kimlik cümlesi en fazla ${IDENTITY_MAX_LENGTH} karakter olabilir.`);
  }

  const traits = draft.traits.map((trait) => ({
    ...trait,
    name: trait.name.trim(),
    habitIds: [...new Set(trait.habitIds)],
  }));
  if (traits.length < MIN_TRAITS) return invalid('En az bir özellik seç.');
  if (traits.length > MAX_TRAITS) return invalid(`En fazla ${MAX_TRAITS} özellik seçilebilir.`);
  if (traits.some((trait) => trait.name.length === 0)) return invalid('Özellik adı boş olamaz.');
  if (traits.some((trait) => trait.name.length > TRAIT_NAME_MAX_LENGTH)) {
    return invalid(`Özellik adı en fazla ${TRAIT_NAME_MAX_LENGTH} karakter olabilir.`);
  }
  const names = new Set(traits.map((trait) => trait.name.toLocaleLowerCase('tr')));
  if (names.size !== traits.length) return invalid('Aynı özellik iki kez eklenemez.');

  // Avatar alanları verilmediyse sonuçta da yer almaz (sunucudaki ayar korunur)
  const { avatar, look, dicebear } = draft;
  if (
    avatar &&
    (!AVATAR_SHAPES.includes(avatar.shape) || !AVATAR_PALETTES.includes(avatar.palette))
  ) {
    return invalid('Geçersiz avatar seçimi.');
  }
  if (look && !isValidLook(look)) return invalid('Geçersiz avatar görünümü.');
  if (dicebear && !isValidDiceBear(dicebear)) return invalid('Geçersiz avatar.');
  return ok({
    identity,
    traits,
    ...(avatar === undefined ? {} : { avatar }),
    ...(look === undefined ? {} : { look }),
    ...(dicebear === undefined ? {} : { dicebear }),
  });
}
