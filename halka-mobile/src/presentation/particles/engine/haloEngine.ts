// Zincir halka arkasındaki parçacık hale (Halka sekmesi): Bugün'deki halka motoru (ringEngine) kare bir
// pencereye alınır. Halka pencerenin ortasında; pencere kenarına yaklaşan toz yumuşakça söner, kenar çizgisi
// oluşmaz. İşaretçi pencere koordinatında gelir, motorun koordinatına çevrilip geri alınır.
import { P_PULSE_X, P_PULSE_Y, P_X, P_Y } from '@presentation/particles/engine/interaction';
import {
  RING_CX,
  RING_CY,
  RING_R,
  stepRing,
  type RingState,
} from '@presentation/particles/engine/ringEngine';
import { OUT_ALPHA, OUT_STRIDE, OUT_X, OUT_Y } from '@presentation/particles/engine/types';

// Pencerenin yarı kenarı (motor px); referans genişlik = 2 × HALO_EXTENT
export const HALO_EXTENT = 180;
export const HALO_REFERENCE_WIDTH = HALO_EXTENT * 2;
// Bu yarıçaptan sonra alfa HALO_EXTENT'te sıfıra iner
export const HALO_FADE_START = 140;
// Hale tozu Bugün'dekinden seyrek (zincirin arkasında sakin bir aura)
export const HALO_DUST = 360;

// Motor koordinatı = pencere koordinatı + kaydırma
const SHIFT_X = RING_CX - HALO_EXTENT;
const SHIFT_Y = RING_CY - HALO_EXTENT;

// Halka yarıçapının pencere genişliğine oranı (çizimde halka çapını eşlemek için)
export const HALO_RING_RATIO = RING_R / HALO_REFERENCE_WIDTH;

// İşaretçi konumlarını kaydırır (sign: +1 pencere → motor, −1 geri)
export function shiftPointer(pointer: Float32Array, sign: number): void {
  'worklet';
  pointer[P_X] = (pointer[P_X] ?? 0) + sign * SHIFT_X;
  pointer[P_Y] = (pointer[P_Y] ?? 0) + sign * SHIFT_Y;
  pointer[P_PULSE_X] = (pointer[P_PULSE_X] ?? 0) + sign * SHIFT_X;
  pointer[P_PULSE_Y] = (pointer[P_PULSE_Y] ?? 0) + sign * SHIFT_Y;
}

// Çıktıyı pencereye taşır ve kenara yaklaşanları söndürür
export function frameHalo(state: RingState): void {
  'worklet';
  const { out, count } = state;
  const span = HALO_EXTENT - HALO_FADE_START;
  for (let i = 0; i < count; i++) {
    const o = i * OUT_STRIDE;
    const x = (out[o + OUT_X] ?? 0) - SHIFT_X;
    const y = (out[o + OUT_Y] ?? 0) - SHIFT_Y;
    out[o + OUT_X] = x;
    out[o + OUT_Y] = y;
    const dx = x - HALO_EXTENT;
    const dy = y - HALO_EXTENT;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > HALO_FADE_START) {
      const k = Math.max(0, 1 - (d - HALO_FADE_START) / span);
      out[o + OUT_ALPHA] = (out[o + OUT_ALPHA] ?? 0) * k * k;
    }
  }
}

// Bir kare: işaretçi motora çevrilir, halka ilerler, çıktı pencereye alınır
export function stepHalo(
  state: RingState,
  dt: number,
  target: number,
  activeFraction: number,
  pointer?: Float32Array,
): void {
  'worklet';
  if (pointer) shiftPointer(pointer, 1);
  stepRing(state, dt, target, activeFraction, pointer);
  if (pointer) shiftPointer(pointer, -1);
  frameHalo(state);
}
