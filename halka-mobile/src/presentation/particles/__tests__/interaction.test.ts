import {
  advancePointer,
  createPointerBuffer,
  P_PULSE_AGE,
  P_STRENGTH,
  PULSE_LIFE,
  PULSE_SPEED,
  pointerField,
  REPEL_RADIUS,
} from '@presentation/particles/engine/interaction';

// Kanal: [x, y, hedef güç, nabız x, nabız y, nabız sayacı]
const touching = (x: number, y: number, serial = 0) => [x, y, 1, x, y, serial];

function settle(pointer: Float32Array, channel: readonly number[], seconds: number) {
  for (let t = 0; t < seconds; t += 1 / 60) advancePointer(pointer, channel, 1 / 60);
}

describe('advancePointer', () => {
  it('güç dokunurken 1e, bırakınca 0a yumuşakça yaklaşır', () => {
    const pointer = createPointerBuffer();
    advancePointer(pointer, touching(100, 100), 1 / 60);
    const first = pointer[P_STRENGTH] ?? 0;
    expect(first).toBeGreaterThan(0);
    expect(first).toBeLessThan(1);
    settle(pointer, touching(100, 100), 1);
    expect(pointer[P_STRENGTH]).toBeCloseTo(1, 2);
    settle(pointer, [100, 100, 0, 0, 0, 0], 1);
    expect(pointer[P_STRENGTH]).toBeCloseTo(0, 2);
  });

  it('yeni nabız sayacı nabzı başlatır, ömrü dolunca söner', () => {
    const pointer = createPointerBuffer();
    expect(pointer[P_PULSE_AGE]).toBe(-1);
    advancePointer(pointer, touching(50, 50, 1), 1 / 60);
    expect(pointer[P_PULSE_AGE]).toBe(0);
    settle(pointer, touching(50, 50, 1), PULSE_LIFE + 0.1);
    expect(pointer[P_PULSE_AGE]).toBe(-1);
  });
});

describe('pointerField', () => {
  it('parmağa yakın parçacığı dışarı iter ve parlatır; uzaktakine dokunmaz', () => {
    const pointer = createPointerBuffer();
    settle(pointer, touching(100, 100), 1);
    const out = new Float32Array(3);
    pointerField(120, 100, pointer, out);
    expect(out[0]).toBeGreaterThan(0);
    expect(out[1]).toBeCloseTo(0, 5);
    expect(out[2]).toBeGreaterThan(0);
    pointerField(100 + REPEL_RADIUS + 10, 100, pointer, out);
    expect(Array.from(out)).toEqual([0, 0, 0]);
  });

  it('nabız cephesi zamanla dışarı yayılır', () => {
    const pointer = createPointerBuffer();
    const channel = [0, 0, 0, 0, 0, 1];
    advancePointer(pointer, channel, 1 / 60);
    settle(pointer, channel, 0.5);
    const out = new Float32Array(3);
    const front = (pointer[P_PULSE_AGE] ?? 0) * PULSE_SPEED;
    pointerField(front, 0, pointer, out);
    const onFront = out[2] ?? 0;
    pointerField(front / 3, 0, pointer, out);
    expect(onFront).toBeGreaterThan(out[2] ?? 0);
    expect(onFront).toBeGreaterThan(0.1);
  });
});
