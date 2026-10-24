import { createPointerBuffer, P_PULSE_X, P_X } from '@presentation/particles/engine/interaction';
import { createWave, stepWave, waveFrameScale } from '@presentation/particles/engine/waveEngine';
import {
  OUT_ALPHA,
  OUT_STRIDE,
  OUT_X,
  OUT_Y,
  REFERENCE_HEIGHT,
  REFERENCE_WIDTH,
} from '@presentation/particles/engine/types';

// Görünen noktaların y aralığı (çizici referans biriminde)
const visibleRange = (out: Float32Array, count: number) => {
  let min = Infinity;
  let max = -Infinity;
  let maxX = -Infinity;
  for (let i = 0; i < count; i++) {
    const o = i * OUT_STRIDE;
    if ((out[o + OUT_ALPHA] ?? 0) <= 0) continue;
    min = Math.min(min, out[o + OUT_Y] ?? 0);
    max = Math.max(max, out[o + OUT_Y] ?? 0);
    maxX = Math.max(maxX, out[o + OUT_X] ?? 0);
  }
  return { min, max, maxX };
};

describe('dalga tabana sabit', () => {
  it('telefon oranında eski davranış korunur', () => {
    expect(waveFrameScale(REFERENCE_HEIGHT)).toBe(1);
    const a = createWave();
    const b = createWave();
    stepWave(a, 1 / 60, 1, 1);
    stepWave(b, 1 / 60, 1, 1, undefined, REFERENCE_HEIGHT);
    expect(Array.from(a.out)).toEqual(Array.from(b.out));
  });

  it('masaüstü (1920×1080) oranında dalga ekranın içinde, alt yarıda', () => {
    const viewHeight = (1080 * REFERENCE_WIDTH) / 1920;
    const state = createWave();
    stepWave(state, 1 / 60, 1, 1, undefined, viewHeight);
    const { min, max, maxX } = visibleRange(state.out, state.count);
    expect(max).toBeLessThanOrEqual(viewHeight);
    expect(min).toBeGreaterThan(viewHeight * 0.5);
    // Geniş ekranda yana yayılır
    expect(maxX).toBeGreaterThan(REFERENCE_WIDTH * 0.9);
  });

  it('uzun telefonda tabana kayar', () => {
    const tall = createWave();
    const base = createWave();
    stepWave(tall, 0, 1, 1, undefined, REFERENCE_HEIGHT + 100);
    stepWave(base, 0, 1, 1);
    expect((tall.out[OUT_Y] ?? 0) - (base.out[OUT_Y] ?? 0)).toBeCloseTo(100, 3);
  });

  it('işaretçi tamponu kare sonunda değişmeden kalır', () => {
    const pointer = createPointerBuffer();
    pointer[P_X] = 123.5;
    pointer[P_PULSE_X] = 50.25;
    const state = createWave();
    stepWave(state, 1 / 60, 1, 1, pointer, 300);
    expect(pointer[P_X]).toBe(123.5);
    expect(pointer[P_PULSE_X]).toBe(50.25);
  });
});
