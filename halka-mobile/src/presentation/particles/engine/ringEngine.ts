// Parçacık halka (Bugün ekranı): halka boyunca akan parçacıklar; üstten saat yönünde dolu kısım
// LUT renginde parlar, boş kısım sönük nötr kalır. Tamamlamada uçtan kıvılcım patlaması.
import { pointerField } from '@presentation/particles/engine/interaction';
import {
  LUT_SIZE,
  lutIndex,
  NEUTRAL_INDEX,
  WARM_START,
} from '@presentation/particles/engine/palette';
import {
  OUT_ALPHA,
  OUT_COLOR,
  OUT_SIZE,
  OUT_STRIDE,
  OUT_X,
  OUT_Y,
  type RandomFn,
} from '@presentation/particles/engine/types';

export const RING_CX = 195;
export const RING_CY = 285;
export const RING_R = 118;
export const RING_COUNT = 1400;
export const RING_DUST = 600;
export const RING_SPARKS = 90;

const TAU = Math.PI * 2;
const HEAD_WINDOW = 0.025;
const SPARK_LIFE = 1.1;
const SPARK_DAMPING = 0.96;
const EASE_RATE = 1.8;

// [geçen süre, gösterilen ilerleme, son işlenen patlama no]
const CLOCK = 0;
const SHOWN = 1;
const LAST_BURST = 2;

export interface RingState {
  readonly ringCount: number;
  readonly dustCount: number;
  readonly sparkCount: number;
  readonly count: number;
  readonly angle: Float32Array;
  readonly off: Float32Array;
  readonly size: Float32Array;
  readonly speed: Float32Array;
  readonly phase: Float32Array;
  // Kıvılcımlar: konum, hız, kalan ömür (0-1)
  readonly sx: Float32Array;
  readonly sy: Float32Array;
  readonly svx: Float32Array;
  readonly svy: Float32Array;
  readonly slife: Float32Array;
  readonly scolor: Float32Array;
  readonly clock: Float64Array;
  // İşaretçi alanı için geçici tampon [dx, dy, parlama]
  readonly field: Float32Array;
  readonly out: Float32Array;
}

export function createRing(
  ringCount: number = RING_COUNT,
  dustCount: number = RING_DUST,
  random: RandomFn = Math.random,
): RingState {
  const total = ringCount + dustCount;
  const count = total + RING_SPARKS;
  const state: RingState = {
    ringCount,
    dustCount,
    sparkCount: RING_SPARKS,
    count,
    angle: new Float32Array(total),
    off: new Float32Array(total),
    size: new Float32Array(total),
    speed: new Float32Array(total),
    phase: new Float32Array(total),
    sx: new Float32Array(RING_SPARKS),
    sy: new Float32Array(RING_SPARKS),
    svx: new Float32Array(RING_SPARKS),
    svy: new Float32Array(RING_SPARKS),
    slife: new Float32Array(RING_SPARKS),
    scolor: new Float32Array(RING_SPARKS),
    clock: new Float64Array(3),
    field: new Float32Array(3),
    out: new Float32Array(count * OUT_STRIDE),
  };
  for (let i = 0; i < total; i++) {
    const dust = i >= ringCount;
    state.angle[i] = random() * TAU;
    state.phase[i] = random() * TAU;
    if (dust) {
      const sign = random() < 0.5 ? -1 : 1;
      state.off[i] = sign * (24 + Math.pow(random(), 1.5) * 120);
      state.size[i] = 0.6 + random() * 1.0;
      state.speed[i] = 0.02 + random() * 0.03;
    } else {
      state.off[i] = (random() + random() + random() - 1.5) * 13;
      state.size[i] = 0.6 + random() * 1.3;
      state.speed[i] = 0.05 + random() * 0.05;
    }
  }
  // İlk girdi patlama sayılmaz
  state.clock[LAST_BURST] = Number.NaN;
  return state;
}

// Halkanın üstünden saat yönünde oran (0-1)
export function fractionOf(angle: number): number {
  'worklet';
  const shifted = (angle + Math.PI / 2) % TAU;
  return (shifted < 0 ? shifted + TAU : shifted) / TAU;
}

// Gösterilen ilerlemeyi doğrudan ayarlar ("hareketi azalt" açıkken)
export function setRingProgress(state: RingState, progress: number): void {
  'worklet';
  state.clock[SHOWN] = Math.max(0, Math.min(1, progress));
}

export function shownProgress(state: RingState): number {
  'worklet';
  return state.clock[SHOWN] ?? 0;
}

// İlerlemenin ucundan kıvılcım patlaması
export function burstRing(state: RingState): void {
  'worklet';
  const head = (state.clock[SHOWN] ?? 0) * TAU - Math.PI / 2;
  const hx = RING_CX + Math.cos(head) * RING_R;
  const hy = RING_CY + Math.sin(head) * RING_R;
  for (let i = 0; i < state.sparkCount; i++) {
    const dir = Math.random() * TAU;
    const velocity = 30 + Math.random() * 120;
    state.sx[i] = hx;
    state.sy[i] = hy;
    state.svx[i] = Math.cos(dir) * velocity;
    state.svy[i] = Math.sin(dir) * velocity;
    state.slife[i] = 0.7 + Math.random() * 0.3;
    state.scolor[i] = WARM_START + Math.floor(Math.random() * (LUT_SIZE - WARM_START));
  }
}

// Patlama nosunu kıvılcım üretmeden kaydeder ("hareketi azalt" açıkken)
export function syncBurst(state: RingState, id: number): void {
  'worklet';
  state.clock[LAST_BURST] = id;
}

// Patlama no değiştiyse bir kez patlat (ilk görülen no yalnızca kaydedilir)
export function consumeBurst(state: RingState, id: number): void {
  'worklet';
  const last = state.clock[LAST_BURST] ?? Number.NaN;
  if (Number.isNaN(last)) {
    state.clock[LAST_BURST] = id;
    return;
  }
  if (id !== last) {
    state.clock[LAST_BURST] = id;
    burstRing(state);
  }
}

export function stepRing(
  state: RingState,
  dt: number,
  target: number,
  activeFraction: number,
  pointer?: Float32Array,
): void {
  'worklet';
  const { angle, off, size, speed, phase, out } = state;
  state.clock[CLOCK] = (state.clock[CLOCK] ?? 0) + dt;
  const t = state.clock[CLOCK] ?? 0;
  const shown = state.clock[SHOWN] ?? 0;
  const next = shown + (target - shown) * Math.min(1, dt * EASE_RATE);
  state.clock[SHOWN] = next;

  const total = state.ringCount + state.dustCount;
  const activeRing = Math.floor(state.ringCount * activeFraction);
  const activeDust = Math.floor(state.dustCount * activeFraction);
  for (let i = 0; i < total; i++) {
    const o = i * OUT_STRIDE;
    const dust = i >= state.ringCount;
    if ((!dust && i >= activeRing) || (dust && i - state.ringCount >= activeDust)) {
      out[o + OUT_ALPHA] = 0;
      continue;
    }
    const a = (angle[i] ?? 0) + (speed[i] ?? 0) * dt;
    angle[i] = a;
    const offset = off[i] ?? 0;
    const radius = RING_R + offset + Math.sin(1.4 * t + (phase[i] ?? 0)) * (dust ? 4 : 1.5);
    const f = fractionOf(a);
    const core = Math.exp(-(offset / 9) * (offset / 9));
    let alpha: number;
    let scale = 1;
    let color: number;
    if (f < next) {
      color = lutIndex(f);
      alpha = dust ? 0.14 + 0.2 * Math.exp(-Math.abs(offset) / 50) : 0.45 + 0.5 * core;
      if (next - f < HEAD_WINDOW) {
        alpha = 1;
        scale = 1.9;
      }
    } else {
      color = NEUTRAL_INDEX;
      alpha = dust ? 0.05 : 0.08 + 0.1 * core;
    }
    let x = RING_CX + Math.cos(a) * radius;
    let y = RING_CY + Math.sin(a) * radius;
    if (pointer) {
      pointerField(x, y, pointer, state.field);
      x += state.field[0] ?? 0;
      y += state.field[1] ?? 0;
      const glow = state.field[2] ?? 0;
      alpha = Math.min(1, alpha + glow * (dust ? 0.35 : 0.7));
      scale *= 1 + 0.6 * glow;
    }
    out[o + OUT_X] = x;
    out[o + OUT_Y] = y;
    out[o + OUT_SIZE] = (size[i] ?? 1) * scale;
    out[o + OUT_ALPHA] = alpha;
    out[o + OUT_COLOR] = color;
  }

  // Kıvılcımlar: kare hızından bağımsız sönümleme
  const damping = Math.pow(SPARK_DAMPING, dt * 60);
  for (let s = 0; s < state.sparkCount; s++) {
    const o = (total + s) * OUT_STRIDE;
    let life = state.slife[s] ?? 0;
    if (life <= 0) {
      out[o + OUT_ALPHA] = 0;
      continue;
    }
    state.svx[s] = (state.svx[s] ?? 0) * damping;
    state.svy[s] = (state.svy[s] ?? 0) * damping;
    state.sx[s] = (state.sx[s] ?? 0) + (state.svx[s] ?? 0) * dt;
    state.sy[s] = (state.sy[s] ?? 0) + (state.svy[s] ?? 0) * dt;
    life -= dt / SPARK_LIFE;
    state.slife[s] = life;
    out[o + OUT_X] = state.sx[s] ?? 0;
    out[o + OUT_Y] = state.sy[s] ?? 0;
    out[o + OUT_SIZE] = 1.6;
    out[o + OUT_ALPHA] = Math.max(0, life);
    out[o + OUT_COLOR] = state.scolor[s] ?? WARM_START;
  }
}
