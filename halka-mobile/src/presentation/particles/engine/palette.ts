// Parçacık renk paletleri: duraklar arası doğrusal geçişle 64 adımlık renk tablosu (LUT).
// Tablonun 65. girdisi (NEUTRAL_INDEX) halkanın boş kısmı için sıcak nötr gridir.
// Saf TypeScript; worklet fonksiyonları mobilde UI thread'de de çalışır.
import { particleOnLight } from '@presentation/particles/config';

export type ParticlePaletteName = 'buzAtes' | 'ates' | 'buz' | 'mor';

export const LUT_SIZE = 64;
export const NEUTRAL_INDEX = LUT_SIZE;
// Sıcak uç (kıvılcımlar) için tablonun son çeyreği
export const WARM_START = 48;

type Rgb = readonly [number, number, number];

const STOPS: Readonly<Record<ParticlePaletteName, readonly Rgb[]>> = {
  // Obsidyen ve Şampanya: koyu altın → şampanya #C9A96E → açık şampanya (adlar sunucuda saklı, korunur)
  buzAtes: [
    [110, 88, 52],
    [156, 127, 76],
    [201, 169, 110],
    [237, 222, 190],
  ],
  // Kehribar: yakut → kehribar → şampanya
  ates: [
    [155, 44, 58],
    [168, 116, 58],
    [227, 203, 154],
  ],
  // Safir: koyu safir → safir → buzlu krem
  buz: [
    [32, 52, 92],
    [72, 104, 160],
    [200, 210, 225],
  ],
  // Ametist: koyu ametist → ametist → lavanta krem
  mor: [
    [62, 40, 88],
    [118, 88, 156],
    [222, 210, 232],
  ],
};

// Boş kısım: sıcak gri (text.secondary ailesi)
const NEUTRAL: Rgb = [0x6e, 0x6a, 0x62];
// Açık tema: boş kısım krem zeminde seçilen açık gri, renkler bu oranla koyulaşır
const NEUTRAL_LIGHT: Rgb = [0x9e, 0x95, 0x86];
const LIGHT_SHADE = 0.68;

// (LUT_SIZE + 1) × 3 değer, 0-255 aralığında RGB
export function buildLut(name: ParticlePaletteName, light = particleOnLight()): Float32Array {
  const stops = STOPS[name];
  const shade = light ? LIGHT_SHADE : 1;
  const lut = new Float32Array((LUT_SIZE + 1) * 3);
  for (let i = 0; i < LUT_SIZE; i++) {
    const t = i / (LUT_SIZE - 1);
    const pos = t * (stops.length - 1);
    const from = Math.min(Math.floor(pos), stops.length - 2);
    const local = pos - from;
    const a = stops[from] ?? NEUTRAL;
    const b = stops[from + 1] ?? NEUTRAL;
    for (let c = 0; c < 3; c++) {
      lut[i * 3 + c] = ((a[c] ?? 0) + ((b[c] ?? 0) - (a[c] ?? 0)) * local) * shade;
    }
  }
  const neutral = light ? NEUTRAL_LIGHT : NEUTRAL;
  lut[NEUTRAL_INDEX * 3] = neutral[0];
  lut[NEUTRAL_INDEX * 3 + 1] = neutral[1];
  lut[NEUTRAL_INDEX * 3 + 2] = neutral[2];
  return lut;
}

// 0-1 arası konumu tablo sırasına çevirir
export function lutIndex(t: number): number {
  'worklet';
  if (t <= 0) return 0;
  if (t >= 1) return LUT_SIZE - 1;
  return Math.floor(t * (LUT_SIZE - 1) + 0.5);
}

// Tablodaki rengin hex karşılığı (#rrggbb; withAlpha ile birlikte kullanılabilir)
export function lutHex(lut: Float32Array, index: number): string {
  const hex = (value: number) => Math.round(value).toString(16).padStart(2, '0');
  return (
    '#' + hex(lut[index * 3] ?? 0) + hex(lut[index * 3 + 1] ?? 0) + hex(lut[index * 3 + 2] ?? 0)
  );
}

// Tablodaki rengin CSS karşılığı (web sprite'ları ve arayüz vurguları için)
export function lutCss(lut: Float32Array, index: number): string {
  const r = Math.round(lut[index * 3] ?? 0);
  const g = Math.round(lut[index * 3 + 1] ?? 0);
  const b = Math.round(lut[index * 3 + 2] ?? 0);
  return `rgb(${r}, ${g}, ${b})`;
}
