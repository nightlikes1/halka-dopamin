// DiceBear stil kaydı: stil modülleri, şemadan düzenlenebilir parçalar ve SVG üretimi (önbellekli).
// Paket yalnızca burada (presentation) import edilir; domain stil adlarını ve seçimleri bilir.
import * as collection from '@dicebear/collection';
import { createAvatar, type Style } from '@dicebear/core';
import { obsidian } from '@core/theme/tokens';
import type { DiceBearAvatar, DiceBearStyleId } from '@features/character/domain/dicebear';

// Stil modülünün kullandığımız kısmı (paket tipleri stil başına farklı seçenek tipi taşır)
interface StyleMeta {
  readonly title?: string;
  readonly creator?: string;
  readonly license?: { readonly name?: string };
}
interface SchemaProperty {
  readonly type?: unknown;
  readonly items?: { readonly enum?: readonly unknown[]; readonly pattern?: unknown };
  readonly default?: unknown;
}
// Stil başına seçenek tipi farklı; burada hepsi tek genel tipte tutulur
type AnyStyle = Style<Record<string, unknown>>;

const STYLES: Readonly<Record<DiceBearStyleId, AnyStyle>> = collection;
const metaOf = (style: DiceBearStyleId): StyleMeta | undefined => STYLES[style].meta;

export interface DiceBearPart {
  readonly key: string;
  readonly kind: 'enum' | 'color';
  readonly values: readonly string[];
  // "yok" seçeneği için olasılık alanı (ör. accessoriesProbability)
  readonly probabilityKey?: string;
}

const isProperty = (value: unknown): value is SchemaProperty =>
  typeof value === 'object' && value !== null;
const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

// Sekme sırası: önce yüz/ten, sonra saç, yüz parçaları, kıyafet, en sonda arka plan
function weight(key: string): number {
  const k = key.toLowerCase();
  if (k.startsWith('background')) return 9;
  if (/^(skin|base|face|head|body|shape$|shape1$)/.test(k)) return 0;
  if (/^(hair|top|fronthair|rearhair|sides|hat)/.test(k)) return 1;
  if (/^(eye|brow|eyebrow)/.test(k)) return 2;
  if (/^(mouth|lips|nose|cheek|blush|freckle|beard|mustache|facialhair)/.test(k)) return 3;
  if (/^(glasses|earring|accessor|mask|ear)/.test(k)) return 4;
  if (/^(cloth|shirt|gesture)/.test(k)) return 5;
  return 6;
}

const partsCache = new Map<DiceBearStyleId, readonly DiceBearPart[]>();

// Şemadaki düzenlenebilir parçalar: birden çok seçenekli listeler (ya da "yok"u olan tekli liste)
// ve renk listeleri. Ofset/döndürme gibi teknik alanlar dışarıda kalır.
export function diceBearParts(style: DiceBearStyleId): readonly DiceBearPart[] {
  const cached = partsCache.get(style);
  if (cached) return cached;
  const properties = STYLES[style].schema?.properties ?? {};
  const parts: DiceBearPart[] = [];
  for (const [key, raw] of Object.entries(properties)) {
    if (!isProperty(raw) || raw.type !== 'array' || !raw.items) continue;
    const probabilityKey = `${key}Probability` in properties ? `${key}Probability` : undefined;
    const options = strings(raw.items.enum);
    if (options.length > 0) {
      if (options.length > 1 || probabilityKey) {
        parts.push({ key, kind: 'enum', values: options, probabilityKey });
      }
      continue;
    }
    if (raw.items.pattern !== undefined) {
      const palette = strings(raw.default).filter((hex) => hex !== 'transparent');
      if (palette.length > 0 || key === 'backgroundColor') {
        parts.push({ key, kind: 'color', values: palette });
      }
    }
  }
  // Aynı grupta önce parça, sonra rengi
  parts.sort(
    (a, b) => weight(a.key) - weight(b.key) || (a.kind === b.kind ? 0 : a.kind === 'enum' ? -1 : 1),
  );
  partsCache.set(style, parts);
  return parts;
}

export function diceBearMeta(style: DiceBearStyleId): {
  readonly creator: string;
  readonly license: string;
} {
  const meta = metaOf(style);
  return { creator: meta?.creator ?? 'DiceBear', license: meta?.license?.name ?? '' };
}

// Üretilen SVG'ler önbellekte (seçenek kutucukları aynı avatarı tekrar tekrar çizer)
const SVG_CACHE_LIMIT = 300;
const svgCache = new Map<string, string>();

export function diceBearSvg(avatar: DiceBearAvatar, seed: string): string {
  const cacheKey = `${avatar.style}|${seed}|${JSON.stringify(avatar.options)}`;
  const cached = svgCache.get(cacheKey);
  if (cached) return cached;
  // radius 50: arka plan seçilse de görsel yuvarlak (avatar dairesine oturur)
  const svg = createAvatar(STYLES[avatar.style], {
    seed,
    radius: 50,
    ...avatar.options,
  }).toString();
  if (svgCache.size >= SVG_CACHE_LIMIT) {
    const oldest = svgCache.keys().next().value;
    if (oldest !== undefined) svgCache.delete(oldest);
  }
  svgCache.set(cacheKey, svg);
  return svg;
}

// Arka plan seçenekleri: şeffaf (aura görünsün) + stilin önerdikleri + uygulama paletinin tonları
const THEME_BACKGROUNDS = [
  obsidian.raised,
  obsidian.borderStrong,
  obsidian.goldDark,
  obsidian.sapphire,
  obsidian.amethyst,
  obsidian.emerald,
  obsidian.ruby,
  obsidian.amber,
].map((hex) => hex.slice(1).toLowerCase());
export const TRANSPARENT = 'transparent';

// Bir parçanın seçilebilir değerleri (renklerde "#" olmadan hex)
export function partValues(part: DiceBearPart): readonly string[] {
  if (part.key !== 'backgroundColor') return part.values;
  return [...new Set([TRANSPARENT, ...part.values, ...THEME_BACKGROUNDS])];
}

// Rastgele avatar: her parça için rastgele seçim; "yok"u olan parçalar yarı yarıya kapalı
export function randomDiceBear(
  style: DiceBearStyleId,
  random: () => number = Math.random,
): DiceBearAvatar {
  const options: Record<string, readonly string[] | number> = {};
  for (const part of diceBearParts(style)) {
    const values = partValues(part);
    const value = values[Math.floor(random() * values.length)];
    if (value !== undefined) options[part.key] = [value];
    if (part.probabilityKey) options[part.probabilityKey] = random() < 0.5 ? 0 : 100;
  }
  return { style, options };
}
