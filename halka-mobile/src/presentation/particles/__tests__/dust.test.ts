import { createDust, stepDust } from '@presentation/particles/engine/dustEngine';
import { WARM_START } from '@presentation/particles/engine/palette';
import { OUT_ALPHA, OUT_COLOR, OUT_STRIDE, OUT_Y } from '@presentation/particles/engine/types';

// Tekrarlanabilir rastgele sayılar
const seeded = (seed = 5) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

describe('ortam tozu', () => {
  it('parçacıklar görünen yükseklik içinde döner', () => {
    const height = 700;
    const state = createDust(80, seeded());
    for (let frame = 0; frame < 600; frame++) stepDust(state, 0.05, height, 1);
    for (let i = 0; i < state.count; i++) {
      const y = state.out[i * OUT_STRIDE + OUT_Y] ?? 0;
      expect(y).toBeGreaterThanOrEqual(-12);
      expect(y).toBeLessThanOrEqual(height + 12);
    }
  });

  it('kenarda söner, alfa sakin kalır', () => {
    const state = createDust(80, seeded());
    stepDust(state, 0, 844, 1);
    for (let i = 0; i < state.count; i++) {
      const o = i * OUT_STRIDE;
      const alpha = state.out[o + OUT_ALPHA] ?? 0;
      expect(alpha).toBeLessThanOrEqual(0.4);
      if ((state.out[o + OUT_Y] ?? 0) <= 0) expect(alpha).toBe(0);
    }
  });

  it('renkler paletin sıcak yarısından', () => {
    const state = createDust(80, seeded());
    stepDust(state, 0, 844, 1);
    for (let i = 0; i < state.count; i++) {
      expect(state.out[i * OUT_STRIDE + OUT_COLOR]).toBeGreaterThanOrEqual(28);
    }
    expect(WARM_START).toBeGreaterThan(28);
  });

  it('düşük güç modunda bir kısmı gizlenir', () => {
    const state = createDust(100, seeded());
    stepDust(state, 0.016, 844, 0.6);
    const visible = Array.from({ length: state.count }, (_, i) => i).filter(
      (i) => (state.out[i * OUT_STRIDE + OUT_ALPHA] ?? 0) > 0,
    );
    expect(visible.every((i) => i < 60)).toBe(true);
  });
});
