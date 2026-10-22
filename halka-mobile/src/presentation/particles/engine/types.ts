// Motorların ortak çıktı biçimi. Her parçacık için OUT_STRIDE değer:
// x, y (390×844 referans koordinatı), boyut (px), alfa (0-1), renk tablosu sırası.
// Çizim katmanı yalnızca bu tamponu okur; motorlar platformdan bağımsızdır.

export const OUT_STRIDE = 5;
export const OUT_X = 0;
export const OUT_Y = 1;
export const OUT_SIZE = 2;
export const OUT_ALPHA = 3;
export const OUT_COLOR = 4;

export const REFERENCE_WIDTH = 390;
export const REFERENCE_HEIGHT = 844;

export interface ParticleOutput {
  readonly count: number;
  readonly out: Float32Array;
}

// Rastgele sayı kaynağı (testlerde sabitlenebilir)
export type RandomFn = () => number;
