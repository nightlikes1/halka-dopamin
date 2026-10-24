import {
  frameHalo,
  HALO_EXTENT,
  HALO_FADE_START,
  shiftPointer,
  stepHalo,
} from '@presentation/particles/engine/haloEngine';
import {
  createPointerBuffer,
  P_PULSE_X,
  P_X,
  P_Y,
} from '@presentation/particles/engine/interaction';
import {
  createRing,
  RING_CX,
  RING_CY,
  RING_R,
  setRingProgress,
} from '@presentation/particles/engine/ringEngine';
import { OUT_ALPHA, OUT_STRIDE, OUT_X, OUT_Y } from '@presentation/particles/engine/types';

// Tekrarlanabilir rastgele sayılar
const seeded = (seed = 11) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const distanceFromCenter = (out: Float32Array, i: number) => {
  const o = i * OUT_STRIDE;
  return Math.hypot((out[o + OUT_X] ?? 0) - HALO_EXTENT, (out[o + OUT_Y] ?? 0) - HALO_EXTENT);
};

describe('hale', () => {
  it('halka pencerenin ortasına taşınır, yarıçap korunur', () => {
    const state = createRing(200, 0, seeded());
    setRingProgress(state, 1);
    stepHalo(state, 0, 1, 1);
    for (let i = 0; i < state.ringCount; i++) {
      expect(Math.abs(distanceFromCenter(state.out, i) - RING_R)).toBeLessThan(25);
    }
  });

  it('pencere kenarındaki toz söner, içteki toz etkilenmez', () => {
    const state = createRing(0, 2, seeded());
    const out = state.out;
    // Biri merkeze yakın, biri pencere dışında
    out[OUT_X] = RING_CX + 50;
    out[OUT_Y] = RING_CY;
    out[OUT_ALPHA] = 0.5;
    out[OUT_STRIDE + OUT_X] = RING_CX + HALO_EXTENT + 10;
    out[OUT_STRIDE + OUT_Y] = RING_CY;
    out[OUT_STRIDE + OUT_ALPHA] = 0.5;
    frameHalo(state);
    expect(out[OUT_ALPHA]).toBe(0.5);
    expect(out[OUT_X]).toBe(HALO_EXTENT + 50);
    expect(out[OUT_STRIDE + OUT_ALPHA]).toBe(0);
    expect(HALO_FADE_START).toBeLessThan(HALO_EXTENT);
  });

  it('işaretçi kaydırması geri alınır (nabız konumu birikmez)', () => {
    const pointer = createPointerBuffer();
    pointer[P_X] = 10;
    pointer[P_Y] = 20;
    pointer[P_PULSE_X] = 30;
    const state = createRing(50, 10, seeded());
    stepHalo(state, 1 / 60, 1, 1, pointer);
    stepHalo(state, 1 / 60, 1, 1, pointer);
    expect(pointer[P_X]).toBe(10);
    expect(pointer[P_Y]).toBe(20);
    expect(pointer[P_PULSE_X]).toBe(30);
    shiftPointer(pointer, 1);
    expect(pointer[P_X]).toBe(10 + RING_CX - HALO_EXTENT);
  });
});
