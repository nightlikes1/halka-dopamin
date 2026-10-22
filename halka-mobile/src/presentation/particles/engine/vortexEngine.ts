// Parçacık girdabı (karşılama ekranı): kara deliğe doğru dönerek çekilen parçacıklar.
// Durum Float32Array'lerde tutulur; step her karede nesne yaratmadan çıktıyı günceller.
import { pointerField } from '@presentation/particles/engine/interaction';
import { lutIndex } from '@presentation/particles/engine/palette';
import {
  OUT_ALPHA,
  OUT_COLOR,
  OUT_SIZE,
  OUT_STRIDE,
  OUT_X,
  OUT_Y,
  type RandomFn,
} from '@presentation/particles/engine/types';

export const VORTEX_CX = 195;
export const VORTEX_CY = 300;
export const VORTEX_HOLE = 72;
export const VORTEX_COUNT = 1800;

const RESPAWN_MIN = 300;
const RESPAWN_SPAN = 90;
const RING_RADIUS = 104;
const RING_WIDTH = 46;
const FADE_EDGE = 92;
const COLOR_SPAN = 460;

export interface VortexState {
  readonly count: number;
  readonly r: Float32Array;
  readonly angle: Float32Array;
  readonly size: Float32Array;
  readonly phase: Float32Array;
  readonly speed: Float32Array;
  // [geçen süre (sn)]
  readonly clock: Float64Array;
  // İşaretçi alanı için geçici tampon [dx, dy, parlama]
  readonly field: Float32Array;
  readonly out: Float32Array;
}

export function createVortex(
  count: number = VORTEX_COUNT,
  random: RandomFn = Math.random,
): VortexState {
  const state: VortexState = {
    count,
    r: new Float32Array(count),
    angle: new Float32Array(count),
    size: new Float32Array(count),
    phase: new Float32Array(count),
    speed: new Float32Array(count),
    clock: new Float64Array(1),
    field: new Float32Array(3),
    out: new Float32Array(count * OUT_STRIDE),
  };
  for (let i = 0; i < count; i++) {
    state.r[i] = 80 + Math.pow(random(), 2.1) * 330;
    state.angle[i] = random() * Math.PI * 2;
    state.size[i] = 0.5 + random() * 1.3;
    state.phase[i] = random() * Math.PI * 2;
    state.speed[i] = 0.6 + random() * 0.6;
  }
  stepVortex(state, 0, count);
  return state;
}

// dt saniye; activeCount sonrasındaki parçacıklar çizilmez (düşük güç modu)
export function stepVortex(
  state: VortexState,
  dt: number,
  activeCount: number,
  pointer?: Float32Array,
): void {
  'worklet';
  const { r, angle, size, phase, speed, out } = state;
  state.clock[0] = (state.clock[0] ?? 0) + dt;
  const t = state.clock[0] ?? 0;
  for (let i = 0; i < state.count; i++) {
    const o = i * OUT_STRIDE;
    if (i >= activeCount) {
      out[o + OUT_ALPHA] = 0;
      continue;
    }
    let radius = r[i] ?? 0;
    let a = angle[i] ?? 0;
    const k = speed[i] ?? 1;
    const q = radius / 80;
    a += ((0.55 * k) / Math.pow(q, 1.35)) * dt;
    radius -= (6 + 40 / q) * 0.25 * dt;
    if (radius < VORTEX_HOLE + 2) {
      radius = RESPAWN_MIN + Math.random() * RESPAWN_SPAN;
      a = Math.random() * Math.PI * 2;
    }
    r[i] = radius;
    angle[i] = a;

    const ringBand = (radius - RING_RADIUS) / RING_WIDTH;
    const ring = Math.exp(-ringBand * ringBand);
    const fadeIn = radius < FADE_EDGE ? Math.max(0, Math.min(1, (radius - VORTEX_HOLE) / 20)) : 1;
    const flicker = 0.65 + 0.35 * Math.sin(2 * t + (phase[i] ?? 0));
    let x = VORTEX_CX + Math.cos(a) * radius;
    let y = VORTEX_CY + Math.sin(a) * radius;
    let glow = 0;
    if (pointer) {
      pointerField(x, y, pointer, state.field);
      x += state.field[0] ?? 0;
      y += state.field[1] ?? 0;
      glow = state.field[2] ?? 0;
    }
    out[o + OUT_X] = x;
    out[o + OUT_Y] = y;
    out[o + OUT_SIZE] = (size[i] ?? 1) * (0.75 + 0.6 * ring) * (1 + 0.6 * glow);
    out[o + OUT_ALPHA] = Math.min(1, (0.22 + 0.72 * ring) * flicker * fadeIn + 0.6 * glow * fadeIn);
    out[o + OUT_COLOR] = lutIndex((x - VORTEX_CX + COLOR_SPAN / 2) / COLOR_SPAN);
  }
}
