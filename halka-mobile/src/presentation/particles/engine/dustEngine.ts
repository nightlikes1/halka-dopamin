// Ortam tozu (Halka sekmesi arka planı): ekrana yayılmış, yavaşça yukarı süzülen ve hafifçe
// salınan seyrek parçacıklar. Üstten çıkan alttan geri gelir; ekranın üst/alt kenarında söner.
import { lutIndex } from '@presentation/particles/engine/palette';
import {
  OUT_ALPHA,
  OUT_COLOR,
  OUT_SIZE,
  OUT_STRIDE,
  OUT_X,
  OUT_Y,
  REFERENCE_HEIGHT,
  REFERENCE_WIDTH,
  type RandomFn,
} from '@presentation/particles/engine/types';

export const DUST_COUNT = 240;
// Görünmez bölgeden geri dönüş payı (referans px)
const WRAP_MARGIN = 12;
// Üst/alt kenarda sönme bandı
const EDGE_FADE = 60;
const SWAY = 9;
const BASE_ALPHA = 0.1;
const TWINKLE_ALPHA = 0.3;

// [geçen süre (sn)]
const CLOCK = 0;

export interface DustState {
  readonly count: number;
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly size: Float32Array;
  readonly speed: Float32Array;
  readonly phase: Float32Array;
  readonly twinkle: Float32Array;
  readonly color: Float32Array;
  readonly clock: Float64Array;
  readonly out: Float32Array;
}

export function createDust(count: number = DUST_COUNT, random: RandomFn = Math.random): DustState {
  const state: DustState = {
    count,
    x: new Float32Array(count),
    y: new Float32Array(count),
    size: new Float32Array(count),
    speed: new Float32Array(count),
    phase: new Float32Array(count),
    twinkle: new Float32Array(count),
    color: new Float32Array(count),
    clock: new Float64Array(1),
    out: new Float32Array(count * OUT_STRIDE),
  };
  for (let i = 0; i < count; i++) {
    state.x[i] = random() * REFERENCE_WIDTH;
    state.y[i] = random() * REFERENCE_HEIGHT;
    // Çoğu küçük toz, az sayıda belirgin yıldız
    state.size[i] = 0.4 + Math.pow(random(), 2.2) * 1.4;
    state.speed[i] = 3 + random() * 9;
    state.phase[i] = random() * Math.PI * 2;
    state.twinkle[i] = 0.4 + random() * 1.2;
    // Paletin sıcak (şampanya) yarısı
    state.color[i] = lutIndex(0.45 + random() * 0.55);
  }
  return state;
}

// height: görünen alanın referans yüksekliği (ekran yüksekliği / ölçek)
export function stepDust(
  state: DustState,
  dt: number,
  height: number,
  activeFraction: number,
): void {
  'worklet';
  const { x, y, size, speed, phase, twinkle, color, out } = state;
  state.clock[CLOCK] = (state.clock[CLOCK] ?? 0) + dt;
  const t = state.clock[CLOCK] ?? 0;
  const h = height > 0 ? height : REFERENCE_HEIGHT;
  const active = Math.floor(state.count * activeFraction);
  for (let i = 0; i < state.count; i++) {
    const o = i * OUT_STRIDE;
    if (i >= active) {
      out[o + OUT_ALPHA] = 0;
      continue;
    }
    let py = (y[i] ?? 0) - (speed[i] ?? 0) * dt;
    if (py < -WRAP_MARGIN) py += h + WRAP_MARGIN * 2;
    else if (py > h + WRAP_MARGIN) py -= h + WRAP_MARGIN * 2;
    y[i] = py;
    const ph = phase[i] ?? 0;
    const glow = 0.5 + 0.5 * Math.sin(t * (twinkle[i] ?? 1) + ph);
    const edge = Math.max(0, Math.min(1, py / EDGE_FADE, (h - py) / EDGE_FADE));
    out[o + OUT_X] = (x[i] ?? 0) + Math.sin(t * 0.25 + ph) * SWAY;
    out[o + OUT_Y] = py;
    out[o + OUT_SIZE] = size[i] ?? 1;
    out[o + OUT_ALPHA] = (BASE_ALPHA + TWINKLE_ALPHA * glow) * edge;
    out[o + OUT_COLOR] = color[i] ?? 0;
  }
}
