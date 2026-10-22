// Çizgi karakter (Bitmoji benzeri) görünümü: kullanıcı kendini parça parça karakterleştirir.
// Renkler palet sırasıdır (renk değerleri tema dosyasında); seçenek adları sunucuyla aynıdır.
// Saf fonksiyonlar: otomatik görünüm, doğrulama ve yakınlığa bağlı ruh hali.

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

type OptionOf<K extends keyof typeof LOOK_OPTIONS> = (typeof LOOK_OPTIONS)[K][number];
export type FaceShape = OptionOf<'face'>;
export type HairStyle = OptionOf<'hair'>;
export type EyeStyle = OptionOf<'eyes'>;
export type BrowStyle = OptionOf<'brows'>;
export type MouthStyle = OptionOf<'mouth'>;
export type FacialHair = OptionOf<'facialHair'>;
export type Glasses = OptionOf<'glasses'>;
export type Accessory = OptionOf<'accessory'>;
export type TopStyle = OptionOf<'top'>;

export interface AvatarLook {
  readonly skin: number;
  readonly face: FaceShape;
  readonly hair: HairStyle;
  readonly hairColor: number;
  readonly eyes: EyeStyle;
  readonly brows: BrowStyle;
  readonly mouth: MouthStyle;
  readonly facialHair: FacialHair;
  readonly glasses: Glasses;
  readonly accessory: Accessory;
  readonly top: TopStyle;
  readonly topColor: number;
}

export type OptionPart = keyof typeof LOOK_OPTIONS;
export type ColorPart = 'skin' | 'hairColor' | 'topColor';

export const COLOR_COUNTS: Readonly<Record<ColorPart, number>> = {
  skin: SKIN_TONE_COUNT,
  hairColor: HAIR_COLOR_COUNT,
  topColor: TOP_COLOR_COUNT,
};

const OPTION_PARTS = Object.keys(LOOK_OPTIONS) as OptionPart[];
const COLOR_PARTS = Object.keys(COLOR_COUNTS) as ColorPart[];

// Tohumlu sözde rastgele (mulberry32): aynı karakter hep aynı görünümü alır
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: readonly T[], next: () => number, fallback: T): T {
  return items[Math.floor(next() * items.length)] ?? fallback;
}

// Kullanıcı henüz düzenlemediyse kimlikten türetilen başlangıç görünümü.
// Sakal, gözlük ve aksesuar çoğunlukla "yok" (başlangıç sade olsun).
export function deriveLook(seed: number): AvatarLook {
  const next = random(seed);
  const rare = <T>(items: readonly T[], none: T) =>
    next() < 0.25 ? pick(items, next, none) : none;
  return {
    skin: Math.floor(next() * SKIN_TONE_COUNT),
    face: pick(LOOK_OPTIONS.face, next, 'oval'),
    hair: pick(
      LOOK_OPTIONS.hair.filter((hair) => hair !== 'bald'),
      next,
      'short',
    ),
    // İlk altı doğal renk (pastel tonlar yalnızca kullanıcı seçerse)
    hairColor: Math.floor(next() * 6),
    eyes: pick(LOOK_OPTIONS.eyes, next, 'round'),
    brows: pick(LOOK_OPTIONS.brows, next, 'soft'),
    mouth: pick(LOOK_OPTIONS.mouth, next, 'smile'),
    facialHair: rare(LOOK_OPTIONS.facialHair, 'none'),
    glasses: rare(LOOK_OPTIONS.glasses, 'none'),
    accessory: rare(LOOK_OPTIONS.accessory, 'none'),
    top: pick(LOOK_OPTIONS.top, next, 'tee'),
    topColor: Math.floor(next() * TOP_COLOR_COUNT),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isValidLook(value: unknown): value is AvatarLook {
  if (!isRecord(value)) return false;
  const optionsOk = OPTION_PARTS.every((part) => {
    const options: readonly string[] = LOOK_OPTIONS[part];
    const chosen = value[part];
    return typeof chosen === 'string' && options.includes(chosen);
  });
  const colorsOk = COLOR_PARTS.every((part) => {
    const chosen = value[part];
    return (
      typeof chosen === 'number' &&
      Number.isInteger(chosen) &&
      chosen >= 0 &&
      chosen < COLOR_COUNTS[part]
    );
  });
  return optionsOk && colorsOk;
}

// Ruh hali son 7 günün yakınlığından: ifade, göz kapağı ve duruş buna göre değişir.
// Kayıt yoksa "sakin" (suçlayıcı değil: düşük yakınlık "dinleniyor" olarak gösterilir).
export const MOODS = ['resting', 'calm', 'good', 'energetic'] as const;
export type Mood = (typeof MOODS)[number];

export function moodFor(percent: number | null): Mood {
  if (percent === null) return 'calm';
  if (percent < 30) return 'resting';
  if (percent < 55) return 'calm';
  if (percent < 80) return 'good';
  return 'energetic';
}
