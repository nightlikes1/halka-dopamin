// Dokunma/fare etkileşimi: parmağın altındaki parçacıklar itilir ve parlar; dokunuş anında
// noktadan halka halka yayılan bir nabız dalgası çıkar. Saf TypeScript, worklet.
//
// İşaretçi tamponu (POINTER_SIZE, simülasyonun referans koordinatlarında):
//   [x, y, yumuşatılmış güç 0-1, nabız x, nabız y, nabız yaşı (sn, < 0 = yok)]

export const POINTER_SIZE = 6;
export const P_X = 0;
export const P_Y = 1;
export const P_STRENGTH = 2;
export const P_PULSE_X = 3;
export const P_PULSE_Y = 4;
export const P_PULSE_AGE = 5;

// İtme alanı (referans px) ve kuvveti
export const REPEL_RADIUS = 80;
const REPEL_PUSH = 28;
// Nabız: yayılma hızı (px/sn), cephe kalınlığı, ömür (sn), itme
export const PULSE_SPEED = 260;
const PULSE_WIDTH = 26;
export const PULSE_LIFE = 1.1;
const PULSE_PUSH = 20;
// Güç ne kadar hızlı hedefe yaklaşır (1/sn)
const STRENGTH_RATE = 8;

// Kanal: arayüzün yazdığı ham girdi [x, y, hedef güç 0/1, nabız x, nabız y, nabız sayacı]
export const CHANNEL_SIZE = 6;
export const C_TARGET = 2;
export const C_PULSE_SERIAL = 5;

export function createPointerBuffer(): Float32Array {
  const buffer = new Float32Array(POINTER_SIZE + 1);
  buffer[P_PULSE_AGE] = -1;
  // Son işlenen nabız sayacı (tamponun sonunda)
  buffer[POINTER_SIZE] = 0;
  return buffer;
}

// Her karede: kanaldaki ham girdiyi tampona işler, gücü yumuşatır, nabzı yaşlandırır
export function advancePointer(
  pointer: Float32Array,
  channel: readonly number[],
  dt: number,
): void {
  'worklet';
  pointer[P_X] = channel[0] ?? 0;
  pointer[P_Y] = channel[1] ?? 0;
  const target = channel[C_TARGET] ?? 0;
  const strength = pointer[P_STRENGTH] ?? 0;
  pointer[P_STRENGTH] = strength + (target - strength) * Math.min(1, dt * STRENGTH_RATE);

  const serial = channel[C_PULSE_SERIAL] ?? 0;
  if (serial !== pointer[POINTER_SIZE]) {
    pointer[POINTER_SIZE] = serial;
    pointer[P_PULSE_X] = channel[3] ?? 0;
    pointer[P_PULSE_Y] = channel[4] ?? 0;
    pointer[P_PULSE_AGE] = 0;
    return;
  }
  const age = pointer[P_PULSE_AGE] ?? -1;
  if (age >= 0) pointer[P_PULSE_AGE] = age + dt > PULSE_LIFE ? -1 : age + dt;
}

// Bir noktaya düşen itme (dx, dy) ve parlama; sonuç `out[0..2]`e yazılır (nesne yaratılmaz)
export function pointerField(x: number, y: number, pointer: Float32Array, out: Float32Array): void {
  'worklet';
  let fx = 0;
  let fy = 0;
  let glow = 0;

  const strength = pointer[P_STRENGTH] ?? 0;
  if (strength > 0.01) {
    const dx = x - (pointer[P_X] ?? 0);
    const dy = y - (pointer[P_Y] ?? 0);
    const d2 = dx * dx + dy * dy;
    if (d2 < REPEL_RADIUS * REPEL_RADIUS) {
      const d = Math.sqrt(d2) + 0.001;
      const falloff = 1 - d / REPEL_RADIUS;
      const f = falloff * falloff * strength;
      fx += (dx / d) * f * REPEL_PUSH;
      fy += (dy / d) * f * REPEL_PUSH;
      glow += f;
    }
  }

  const age = pointer[P_PULSE_AGE] ?? -1;
  if (age >= 0) {
    const dx = x - (pointer[P_PULSE_X] ?? 0);
    const dy = y - (pointer[P_PULSE_Y] ?? 0);
    const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
    const band = (d - age * PULSE_SPEED) / PULSE_WIDTH;
    const wave = Math.exp(-band * band) * (1 - age / PULSE_LIFE);
    fx += (dx / d) * wave * PULSE_PUSH;
    fy += (dy / d) * wave * PULSE_PUSH;
    glow += wave;
  }

  out[0] = fx;
  out[1] = fy;
  out[2] = glow;
}
