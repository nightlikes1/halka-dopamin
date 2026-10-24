// Parçacık dalga (Odak ekranı): perspektifli nokta arazisi; sayaç çalışırken dalgalanır,
// duraklayınca sakinleşir. Sütun/satır ızgarası sabittir, her karede yalnızca yükseklik hesaplanır.
// Arazi ekranın tabanına sabitlenir: çizici genişliğe göre ölçekler, geniş/yatay ekranda (masaüstü web)
// arazi yüksekliğe göre küçültülür ve yana genişletilir; uzun telefonda tabana kaydırılır.
import {
  P_PULSE_X,
  P_PULSE_Y,
  P_X,
  P_Y,
  pointerField,
} from '@presentation/particles/engine/interaction';
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
} from '@presentation/particles/engine/types';

export const WAVE_COLS = 78;
export const WAVE_ROWS = 40;
export const WAVE_HORIZON = 548;
export const WAVE_FOCAL = 250;
export const WAVE_RUNNING_AMP = 1;
export const WAVE_IDLE_AMP = 0.4;

const FAR_Z = 7.5;
const DEPTH_SPAN = 6.6;
const WIDTH_SPAN = 15;
const RIPPLE_Z = 4.6;
const VERTICAL = 0.95;
const AMP_RATE = 1.5;
const THIN_PATTERN = 5;

// [faz zamanı, mevcut genlik]
const PHASE = 0;
const AMP = 1;

export interface WaveState {
  readonly cols: number;
  readonly rows: number;
  readonly count: number;
  readonly clock: Float64Array;
  // İşaretçi alanı için geçici tampon [dx, dy, parlama]
  readonly field: Float32Array;
  readonly out: Float32Array;
}

export function createWave(initialAmp: number = WAVE_IDLE_AMP): WaveState {
  const count = WAVE_COLS * WAVE_ROWS;
  const state: WaveState = {
    cols: WAVE_COLS,
    rows: WAVE_ROWS,
    count,
    clock: new Float64Array(2),
    field: new Float32Array(3),
    out: new Float32Array(count * OUT_STRIDE),
  };
  state.clock[AMP] = initialAmp;
  stepWave(state, 0, initialAmp, 1);
  return state;
}

// Bir noktanın yüksekliği (test edilebilsin diye ayrı)
export function waveHeight(x: number, z: number, t: number, amp: number): number {
  'worklet';
  let y =
    amp *
    (0.16 * Math.sin(0.9 * x + 0.9 * t) +
      0.12 * Math.sin(1.6 * z - 1.1 * t) +
      0.06 * Math.sin(2.1 * (x + z) + 1.4 * t));
  const d = Math.sqrt(x * x + (z - RIPPLE_Z) * (z - RIPPLE_Z));
  y += 0.14 * amp * Math.sin(3.6 * d - 2.2 * t) * Math.exp(-0.42 * d);
  return y;
}

// Dünya koordinatından ekran y'sine (ufuk referans koordinatında WAVE_HORIZON)
export function projectY(y: number, z: number): number {
  'worklet';
  return WAVE_HORIZON + ((1 - y) / z) * WAVE_FOCAL * VERTICAL - (1 / FAR_Z) * WAVE_FOCAL * VERTICAL;
}

// Görünen alanın yüksekliği (çizici referansında, genişlik 390) → arazi ölçeği (≤ 1).
// Alan 390×844'ten basıksa (geniş ekran) arazi yüksekliğe sığacak kadar küçülür.
export function waveFrameScale(viewHeight: number): number {
  'worklet';
  const height = viewHeight > 0 ? viewHeight : REFERENCE_HEIGHT;
  return Math.min(1, height / REFERENCE_HEIGHT);
}

// viewHeight: görünen alanın yüksekliği, çizici referans biriminde (ekran yüksekliği × 390 / genişlik)
export function stepWave(
  state: WaveState,
  dt: number,
  targetAmp: number,
  activeFraction: number,
  pointer?: Float32Array,
  viewHeight: number = REFERENCE_HEIGHT,
): void {
  'worklet';
  // Arazi koordinatı × k = çizici koordinatı
  const k = waveFrameScale(viewHeight);
  const frameWidth = REFERENCE_WIDTH / k;
  const frameHeight = (viewHeight > 0 ? viewHeight : REFERENCE_HEIGHT) / k;
  // Ufuk tabana göre konumlanır; geniş alanda arazi yana yayılır
  const shiftY = frameHeight - REFERENCE_HEIGHT;
  const widen = frameWidth / REFERENCE_WIDTH;
  // İşaretçi arazi koordinatına çevrilir, karenin sonunda aynen geri yazılır
  const px = pointer ? (pointer[P_X] ?? 0) : 0;
  const py = pointer ? (pointer[P_Y] ?? 0) : 0;
  const ppx = pointer ? (pointer[P_PULSE_X] ?? 0) : 0;
  const ppy = pointer ? (pointer[P_PULSE_Y] ?? 0) : 0;
  if (pointer) {
    pointer[P_X] = px / k;
    pointer[P_Y] = py / k;
    pointer[P_PULSE_X] = ppx / k;
    pointer[P_PULSE_Y] = ppy / k;
  }
  const amp0 = state.clock[AMP] ?? WAVE_IDLE_AMP;
  const amp = amp0 + (targetAmp - amp0) * Math.min(1, dt * AMP_RATE);
  state.clock[AMP] = amp;
  state.clock[PHASE] = (state.clock[PHASE] ?? 0) + dt * (0.4 + 0.6 * amp);
  const t = state.clock[PHASE] ?? 0;
  const { out, cols, rows } = state;
  // Düşük güç modunda noktalar yüzeye eşit dağılarak seyreltilir: her 5 noktadan ~5×oran kadarı kalır
  const keepOfFive = Math.max(1, Math.round(activeFraction * THIN_PATTERN));
  for (let j = 0; j < rows; j++) {
    const dT = j / (rows - 1);
    const z = FAR_Z - dT * DEPTH_SPAN;
    for (let i = 0; i < cols; i++) {
      const o = (j * cols + i) * OUT_STRIDE;
      if (keepOfFive < THIN_PATTERN && (i * 3 + j) % THIN_PATTERN >= keepOfFive) {
        out[o + OUT_ALPHA] = 0;
        continue;
      }
      const x = (i / (cols - 1) - 0.5) * WIDTH_SPAN * widen;
      const y = waveHeight(x, z, t, amp);
      let sx = frameWidth / 2 + (x / z) * WAVE_FOCAL;
      let sy = projectY(y, z) + shiftY;
      const crest = Math.max(0.35, Math.min(1.4, 0.8 + 2.2 * y));
      let glow = (0.16 + 0.85 * Math.pow(1 - dT, 1.6)) * crest;
      let lift = 0;
      if (pointer) {
        // Dokunuş yüzeyde yükselen bir dalgacık gibi: daha çok dikey itme
        pointerField(sx, sy, pointer, state.field);
        sx += (state.field[0] ?? 0) * 0.35;
        sy -= Math.abs(state.field[1] ?? 0) * 0.8 + (state.field[2] ?? 0) * 6;
        lift = state.field[2] ?? 0;
        glow += lift * 0.8;
      }
      const visible = sx > -8 && sx < frameWidth + 8;
      out[o + OUT_X] = sx * k;
      out[o + OUT_Y] = sy * k;
      out[o + OUT_SIZE] = (0.8 + 1.7 * dT) * (1 + 0.5 * lift) * k;
      out[o + OUT_ALPHA] = visible ? Math.min(1, glow) : 0;
      out[o + OUT_COLOR] = lutIndex(sx / frameWidth);
    }
  }
  if (pointer) {
    pointer[P_X] = px;
    pointer[P_Y] = py;
    pointer[P_PULSE_X] = ppx;
    pointer[P_PULSE_Y] = ppy;
  }
}

export function currentAmp(state: WaveState): number {
  'worklet';
  return state.clock[AMP] ?? WAVE_IDLE_AMP;
}
