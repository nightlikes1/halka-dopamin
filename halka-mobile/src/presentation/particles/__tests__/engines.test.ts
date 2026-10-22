import {
  AVATAR_REF,
  createAvatar,
  settleAvatar,
  stepAvatar,
} from '@presentation/particles/engine/avatarEngine';
import {
  buildLut,
  LUT_SIZE,
  lutIndex,
  NEUTRAL_INDEX,
} from '@presentation/particles/engine/palette';
import {
  burstRing,
  createRing,
  fractionOf,
  RING_SPARKS,
  setRingProgress,
  shownProgress,
  stepRing,
} from '@presentation/particles/engine/ringEngine';
import { OUT_ALPHA, OUT_COLOR, OUT_STRIDE, OUT_Y } from '@presentation/particles/engine/types';
import { createVortex, stepVortex, VORTEX_HOLE } from '@presentation/particles/engine/vortexEngine';
import {
  createWave,
  currentAmp,
  projectY,
  stepWave,
  WAVE_HORIZON,
  WAVE_RUNNING_AMP,
} from '@presentation/particles/engine/waveEngine';

// Tekrarlanabilir rastgele sayılar
const seeded = (seed = 7) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const finite = (arr: Float32Array) => arr.every((v) => Number.isFinite(v));

describe('palette', () => {
  it('varsayılan palet koyu altından açık şampanyaya gider, nötr girdi ayrıdır', () => {
    const lut = buildLut('buzAtes');
    expect([lut[0], lut[1], lut[2]]).toEqual([110, 88, 52]);
    const last = (LUT_SIZE - 1) * 3;
    // Açık uç: açık şampanya
    expect([lut[last], lut[last + 1], lut[last + 2]]).toEqual([237, 222, 190]);
    expect(lut[NEUTRAL_INDEX * 3]).toBe(0x6e);
  });

  it('konumu tablo sınırları içinde tutar', () => {
    expect(lutIndex(-1)).toBe(0);
    expect(lutIndex(0.5)).toBe(32);
    expect(lutIndex(2)).toBe(LUT_SIZE - 1);
  });
});

describe('vortex', () => {
  it('parçacıklar deliğe düşünce dışarıda yeniden doğar', () => {
    const state = createVortex(400, seeded());
    for (let i = 0; i < 600; i++) stepVortex(state, 1 / 30, state.count);
    expect(finite(state.out)).toBe(true);
    expect(state.r.every((r) => r >= VORTEX_HOLE + 2 && r <= 410)).toBe(true);
  });

  it('aktif sayı dışındaki parçacıklar görünmez', () => {
    const state = createVortex(100, seeded());
    stepVortex(state, 1 / 60, 60);
    expect(state.out[80 * OUT_STRIDE + OUT_ALPHA]).toBe(0);
  });
});

describe('ring', () => {
  it('üst nokta 0, saat yönünde çeyrek 0,25 sayılır', () => {
    expect(fractionOf(-Math.PI / 2)).toBeCloseTo(0);
    expect(fractionOf(0)).toBeCloseTo(0.25);
  });

  it('gösterilen ilerleme 0dan hedefe yumuşakça yaklaşır', () => {
    const state = createRing(200, 50, seeded());
    stepRing(state, 1 / 60, 0.7, 1);
    expect(shownProgress(state)).toBeGreaterThan(0);
    expect(shownProgress(state)).toBeLessThan(0.1);
    for (let i = 0; i < 300; i++) stepRing(state, 1 / 60, 0.7, 1);
    expect(shownProgress(state)).toBeCloseTo(0.7, 2);
    expect(finite(state.out)).toBe(true);
  });

  it('dolu kısım renkli, boş kısım nötr', () => {
    const state = createRing(400, 0, seeded());
    setRingProgress(state, 0.5);
    stepRing(state, 0, 0.5, 1);
    for (let i = 0; i < 400; i++) {
      const color = state.out[i * OUT_STRIDE + OUT_COLOR];
      const filled = fractionOf(state.angle[i] ?? 0) < 0.5;
      expect(color === NEUTRAL_INDEX).toBe(!filled);
    }
  });

  it('patlama kıvılcımları zamanla söner', () => {
    const state = createRing(10, 0, seeded());
    burstRing(state);
    const sparkAlpha = () => state.out[(10 + 0) * OUT_STRIDE + OUT_ALPHA] ?? 0;
    stepRing(state, 1 / 60, 0, 1);
    expect(sparkAlpha()).toBeGreaterThan(0.5);
    for (let i = 0; i < 90; i++) stepRing(state, 1 / 60, 0, 1);
    expect(sparkAlpha()).toBe(0);
    expect(state.count).toBe(10 + RING_SPARKS);
  });
});

describe('wave', () => {
  it('uzak düz nokta ufuk çizgisine düşer', () => {
    expect(projectY(0, 7.5)).toBeCloseTo(WAVE_HORIZON);
    expect(projectY(0, 0.9)).toBeGreaterThan(WAVE_HORIZON + 200);
  });

  it('genlik hedefe yaklaşır ve çıktı geçerli kalır', () => {
    const state = createWave();
    for (let i = 0; i < 240; i++) stepWave(state, 1 / 60, WAVE_RUNNING_AMP, 1);
    expect(currentAmp(state)).toBeCloseTo(1, 1);
    expect(finite(state.out)).toBe(true);
    // İlk satır (uzak) ufka yakın
    expect(Math.abs((state.out[OUT_Y] ?? 0) - WAVE_HORIZON)).toBeLessThan(15);
  });
});

describe('düşük güç modu', () => {
  it('dalga noktalarını ~%60 oranında bırakır', () => {
    const state = createWave();
    stepWave(state, 1 / 60, 1, 0.6);
    let visible = 0;
    for (let i = 0; i < state.count; i++)
      if ((state.out[i * OUT_STRIDE + OUT_ALPHA] ?? 0) > 0) visible++;
    const full = createWave();
    stepWave(full, 1 / 60, 1, 1);
    let fullVisible = 0;
    for (let i = 0; i < full.count; i++)
      if ((full.out[i * OUT_STRIDE + OUT_ALPHA] ?? 0) > 0) fullVisible++;
    expect(visible / fullVisible).toBeGreaterThan(0.55);
    expect(visible / fullVisible).toBeLessThan(0.65);
  });
});

describe('avatar', () => {
  const visibleCount = (out: Float32Array, count: number) => {
    let visible = 0;
    for (let i = 0; i < count; i++) if ((out[i * OUT_STRIDE + OUT_ALPHA] ?? 0) > 0) visible++;
    return visible;
  };

  it.each(['orbit', 'flower', 'crystal'] as const)(
    '%s biçimi alan içinde geçerli çıktı üretir',
    (shape) => {
      const state = createAvatar({ shape, layers: 5, seed: 1234 });
      for (let i = 0; i < 120; i++) stepAvatar(state, 1 / 60, 0.8, 1);
      expect(finite(state.out)).toBe(true);
      for (let i = 0; i < state.count; i++) {
        const x = state.out[i * OUT_STRIDE] ?? 0;
        const y = state.out[i * OUT_STRIDE + 1] ?? 0;
        expect(x).toBeGreaterThan(-5);
        expect(x).toBeLessThan(AVATAR_REF + 5);
        expect(y).toBeGreaterThan(-5);
        expect(y).toBeLessThan(AVATAR_REF + 5);
      }
    },
  );

  it('aynı tohum aynı avatarı üretir', () => {
    const a = createAvatar({ shape: 'flower', layers: 3, seed: 42 });
    const b = createAvatar({ shape: 'flower', layers: 3, seed: 42 });
    stepAvatar(a, 0.5, 0.6, 1);
    stepAvatar(b, 0.5, 0.6, 1);
    expect(Array.from(a.out)).toEqual(Array.from(b.out));
  });

  it('yakınlık arttıkça daha çok parçacık görünür', () => {
    const low = createAvatar({ shape: 'orbit', layers: 3, seed: 7 });
    const high = createAvatar({ shape: 'orbit', layers: 3, seed: 7 });
    settleAvatar(low, 0);
    settleAvatar(high, 1);
    expect(visibleCount(high.out, high.count)).toBeGreaterThan(
      visibleCount(low.out, low.count) * 1.5,
    );
  });
});
