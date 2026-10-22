// DiceBear avatarı: stil + kullanıcının seçtiği seçenekler (parça adları, renkler, olasılıklar).
// Seçilmeyen parçalar karakterin tohumundan kararlı biçimde gelir. Domain paket import etmez;
// stil adları @dicebear/collection ile aynıdır (sunucu da aynı listeyi doğrular).

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
export type DiceBearStyleId = (typeof DICEBEAR_STYLES)[number];

// Parça/renk seçimi (ör. ["short01"], ["c9a96e"]) ya da olasılık 0-100 ("yok" = 0)
export type DiceBearOptionValue = readonly string[] | number;
export type DiceBearOptions = Readonly<Record<string, DiceBearOptionValue>>;

export interface DiceBearAvatar {
  readonly style: DiceBearStyleId;
  readonly options: DiceBearOptions;
}

export const DICEBEAR_MAX_OPTIONS = 60;
const TOKEN = /^[a-zA-Z0-9]{1,40}$/;

export const isDiceBearStyle = (value: unknown): value is DiceBearStyleId =>
  typeof value === 'string' && (DICEBEAR_STYLES as readonly string[]).includes(value);

function isOptionValue(value: unknown): value is DiceBearOptionValue {
  if (typeof value === 'number') return Number.isInteger(value) && value >= 0 && value <= 100;
  return (
    Array.isArray(value) &&
    value.length <= 4 &&
    value.every((item) => typeof item === 'string' && TOKEN.test(item))
  );
}

export function isValidDiceBear(value: unknown): value is DiceBearAvatar {
  if (typeof value !== 'object' || value === null) return false;
  const { style, options } = value as { style?: unknown; options?: unknown };
  if (!isDiceBearStyle(style) || typeof options !== 'object' || options === null) return false;
  const entries = Object.entries(options);
  return (
    entries.length <= DICEBEAR_MAX_OPTIONS &&
    entries.every(([key, item]) => TOKEN.test(key) && isOptionValue(item))
  );
}

// Bir parçayı seç: değer verilir, "yok" olasılığı varsa %100'e çekilir
export function chooseDiceBearPart(
  avatar: DiceBearAvatar,
  key: string,
  value: string,
  probabilityKey?: string,
): DiceBearAvatar {
  return {
    ...avatar,
    options: {
      ...avatar.options,
      [key]: [value],
      ...(probabilityKey ? { [probabilityKey]: 100 } : {}),
    },
  };
}

// Parçayı kaldır ("yok"): olasılık 0
export function removeDiceBearPart(avatar: DiceBearAvatar, probabilityKey: string): DiceBearAvatar {
  return { ...avatar, options: { ...avatar.options, [probabilityKey]: 0 } };
}

// Seçili mi: açık seçim varsa o, yoksa tohumdan gelen (bilinmiyor) — editörde vurgulamak için
export function selectedDiceBearValue(avatar: DiceBearAvatar, key: string): string | null {
  const value = avatar.options[key];
  return Array.isArray(value) ? (value[0] ?? null) : null;
}

export function isDiceBearPartRemoved(avatar: DiceBearAvatar, probabilityKey: string): boolean {
  return avatar.options[probabilityKey] === 0;
}
