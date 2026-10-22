// Potansiyel Karakterim istek/yanıt şemaları
import { z } from 'zod';

export const IDENTITY_MAX_LENGTH = 60;
export const TRAIT_NAME_MAX_LENGTH = 30;
export const MIN_TRAITS = 1;
export const MAX_TRAITS = 5;
export const MAX_HABITS_PER_TRAIT = 20;

// Parçacık avatar seçenekleri (mobil arayüzle aynı adlar)
export const AVATAR_SHAPES = ['orbit', 'flower', 'crystal'] as const;
export const AVATAR_PALETTES = ['buzAtes', 'ates', 'buz', 'mor'] as const;

const avatarSchema = z.object({
  shape: z.enum(AVATAR_SHAPES, 'Geçersiz avatar biçimi.'),
  palette: z.enum(AVATAR_PALETTES, 'Geçersiz avatar paleti.'),
});
export type AvatarDto = z.infer<typeof avatarSchema>;

// Çizgi karakter seçenekleri (mobil arayüzle aynı adlar; renkler palet sırası)
export const LOOK_OPTIONS = {
  face: ['oval', 'round', 'square', 'long'],
  hair: ['short', 'buzz', 'side', 'curly', 'long', 'bun', 'afro', 'bob', 'mohawk', 'bald'],
  eyes: ['round', 'almond', 'wide', 'narrow'],
  brows: ['soft', 'straight', 'arched', 'thick'],
  mouth: ['smile', 'lips', 'teeth', 'small'],
  facialHair: ['none', 'stubble', 'mustache', 'beard', 'goatee'],
  glasses: ['none', 'round', 'square', 'sun'],
  accessory: ['none', 'beanie', 'cap', 'headband', 'earrings'],
  top: ['tee', 'hoodie', 'shirt', 'sweater', 'tank'],
} as const;
export const SKIN_TONE_COUNT = 6;
export const HAIR_COLOR_COUNT = 8;
export const TOP_COLOR_COUNT = 8;

const colorIndex = (count: number) =>
  z
    .number()
    .int()
    .min(0)
    .max(count - 1);

export const lookSchema = z.object(
  {
    skin: colorIndex(SKIN_TONE_COUNT),
    face: z.enum(LOOK_OPTIONS.face),
    hair: z.enum(LOOK_OPTIONS.hair),
    hairColor: colorIndex(HAIR_COLOR_COUNT),
    eyes: z.enum(LOOK_OPTIONS.eyes),
    brows: z.enum(LOOK_OPTIONS.brows),
    mouth: z.enum(LOOK_OPTIONS.mouth),
    facialHair: z.enum(LOOK_OPTIONS.facialHair),
    glasses: z.enum(LOOK_OPTIONS.glasses),
    accessory: z.enum(LOOK_OPTIONS.accessory),
    top: z.enum(LOOK_OPTIONS.top),
    topColor: colorIndex(TOP_COLOR_COUNT),
  },
  'Geçersiz avatar görünümü.',
);
export type LookDto = z.infer<typeof lookSchema>;

// DiceBear stilleri (mobil uygulamadaki @dicebear/collection adlarıyla aynı)
export const DICEBEAR_STYLES = [
  'adventurer',
  'adventurerNeutral',
  'avataaars',
  'avataaarsNeutral',
  'bigEars',
  'bigEarsNeutral',
  'bigSmile',
  'bottts',
  'botttsNeutral',
  'croodles',
  'croodlesNeutral',
  'dylan',
  'funEmoji',
  'glass',
  'icons',
  'identicon',
  'initials',
  'lorelei',
  'loreleiNeutral',
  'micah',
  'miniavs',
  'notionists',
  'notionistsNeutral',
  'openPeeps',
  'personas',
  'pixelArt',
  'pixelArtNeutral',
  'rings',
  'shapes',
  'thumbs',
  'toonHead',
] as const;
export const DICEBEAR_MAX_OPTIONS = 60;
const optionKey = z.string().regex(/^[a-zA-Z0-9]{1,40}$/, 'Geçersiz avatar seçeneği.');
// Seçenek değeri: parça/renk adları (ör. ["short01"], ["c9a96e"]) ya da olasılık (0-100)
const optionValue = z.union([
  z.array(z.string().regex(/^[a-zA-Z0-9]{1,40}$/)).max(4),
  z.number().int().min(0).max(100),
]);
export const dicebearSchema = z.object(
  {
    style: z.enum(DICEBEAR_STYLES, 'Geçersiz avatar stili.'),
    options: z
      .record(optionKey, optionValue)
      .refine(
        (options) => Object.keys(options).length <= DICEBEAR_MAX_OPTIONS,
        'Çok fazla seçenek.',
      ),
  },
  'Geçersiz avatar.',
);
export type DicebearDto = z.infer<typeof dicebearSchema>;

const traitInputSchema = z.object({
  // Var olan özelliği güncellemek için; yoksa yeni özellik oluşturulur
  id: z.uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, 'Özellik adı boş olamaz.')
    .max(TRAIT_NAME_MAX_LENGTH, `Özellik adı en fazla ${TRAIT_NAME_MAX_LENGTH} karakter.`),
  habitIds: z
    .array(z.uuid('Geçersiz alışkanlık kimliği.'))
    .max(MAX_HABITS_PER_TRAIT)
    .transform((ids) => [...new Set(ids)]),
});

export const saveCharacterBodySchema = z.object({
  identity: z
    .string()
    .trim()
    .min(1, 'Kimlik cümlesi boş olamaz.')
    .max(IDENTITY_MAX_LENGTH, `En fazla ${IDENTITY_MAX_LENGTH} karakter.`),
  traits: z
    .array(traitInputSchema)
    .min(MIN_TRAITS, `En az ${MIN_TRAITS} özellik seç.`)
    .max(MAX_TRAITS, `En fazla ${MAX_TRAITS} özellik seçilebilir.`)
    .refine(
      (traits) =>
        new Set(traits.map((trait) => trait.name.toLocaleLowerCase('tr'))).size === traits.length,
      'Aynı özellik iki kez eklenemez.',
    ),
  // Gönderilmezse mevcut avatar korunur; null otomatiğe döndürür
  avatar: avatarSchema.nullable().optional(),
  // Çizgi karakter görünümü; aynı kural (yok = koru, null = otomatik)
  look: lookSchema.nullable().optional(),
  // DiceBear avatarı; aynı kural (yok = koru, null = kendi çizgi karakterimize dön)
  dicebear: dicebearSchema.nullable().optional(),
});
export type SaveCharacterInput = z.infer<typeof saveCharacterBodySchema>;

export interface TraitDto {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  readonly habitIds: readonly string[];
}

export interface CharacterDto {
  readonly id: string;
  readonly identity: string;
  readonly createdAt: string;
  readonly avatar: AvatarDto | null;
  readonly look: LookDto | null;
  readonly dicebear: DicebearDto | null;
  readonly traits: readonly TraitDto[];
}
