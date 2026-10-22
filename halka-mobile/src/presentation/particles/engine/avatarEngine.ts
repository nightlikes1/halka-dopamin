// Parçacık avatar (Potansiyel Karakterim): ortada nefes alan çekirdek (kimlik), çevresinde her özellik
// için bir katman. Katmanın biçimi seçime göre yörünge, çiçek ya da kristaldir; karakterden türetilen
// tohum eğimleri, hızları ve yaprak/köşe sayılarını belirler. Enerji (yakınlık) arttıkça daha çok
// parçacık görünür ve parlar. Referans alan 240 × 240.
import { pointerField } from '@presentation/particles/engine/interaction';
import { lutIndex } from '@presentation/particles/engine/palette';
import {
  OUT_ALPHA,
  OUT_COLOR,
  OUT_SIZE,
  OUT_STRIDE,
  OUT_X,
  OUT_Y,
} from '@presentation/particles/engine/types';

export const AVATAR_REF = 240;
export const AVATAR_COUNT = 1000;
const CENTER = AVATAR_REF / 2;
const CORE_COUNT = 200;
const CORE_RADIUS = 15;
const LAYER_BASE = 46;
const LAYER_GAP = 13;
const MAX_LAYERS = 5;
const ENERGY_RATE = 1.5;
// Yakınlık bilinmiyorken (check-in yok) avatarın sakin hali
export const IDLE_ENERGY = 0.35;

export type AvatarShapeKind = 'orbit' | 'flower' | 'crystal';

export interface AvatarConfig {
  readonly shape: AvatarShapeKind;
  // Özellik sayısı (1-5)
  readonly layers: number;
  readonly seed: number;
}

// Biçim kodu (worklet içinde metin karşılaştırması yerine)
const SHAPE_CODE: Readonly<Record<AvatarShapeKind, number>> = { orbit: 0, flower: 1, crystal: 2 };

// [geçen süre, mevcut enerji]
const CLOCK = 0;
const ENERGY = 1;

export interface AvatarState {
  readonly count: number;
  readonly shape: number;
  readonly layers: number;
  // Parçacık başına: katman (-1 = çekirdek), eğri üzerindeki konum, görünme sırası, sapma, faz, boyut
  readonly layer: Float32Array;
  readonly u: Float32Array;
  readonly rank: Float32Array;
  readonly jitter: Float32Array;
  readonly phase: Float32Array;
  readonly size: Float32Array;
  // Katman başına: eğim, dönüş hızı/yönü, basıklık, yaprak/köşe sayısı, akış hızı
  readonly tilt: Float32Array;
  readonly spin: Float32Array;
  readonly squash: Float32Array;
  readonly lobes: Float32Array;
  readonly flow: Float32Array;
  readonly clock: Float64Array;
  readonly field: Float32Array;
  readonly out: Float32Array;
}

// Tohumlu rastgele sayı (mulberry32): aynı karakter hep aynı avatarı üretir
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createAvatar(config: AvatarConfig): AvatarState {
  const random = seededRandom(config.seed);
  const layers = Math.max(1, Math.min(MAX_LAYERS, Math.round(config.layers)));
  const count = AVATAR_COUNT;
  const state: AvatarState = {
    count,
    shape: SHAPE_CODE[config.shape],
    layers,
    layer: new Float32Array(count),
    u: new Float32Array(count),
    rank: new Float32Array(count),
    jitter: new Float32Array(count),
    phase: new Float32Array(count),
    size: new Float32Array(count),
    tilt: new Float32Array(layers),
    spin: new Float32Array(layers),
    squash: new Float32Array(layers),
    lobes: new Float32Array(layers),
    flow: new Float32Array(layers),
    clock: new Float64Array(2),
    field: new Float32Array(3),
    out: new Float32Array(count * OUT_STRIDE),
  };
  for (let l = 0; l < layers; l++) {
    const direction = l % 2 === 0 ? 1 : -1;
    state.tilt[l] = random() * Math.PI;
    state.spin[l] = direction * (0.05 + random() * 0.09);
    state.squash[l] = 0.32 + random() * 0.3;
    state.lobes[l] = 3 + ((config.seed >>> (l * 3)) % 4);
    state.flow[l] = direction * (0.04 + random() * 0.05);
  }
  const perLayer = Math.floor((count - CORE_COUNT) / layers);
  for (let i = 0; i < count; i++) {
    const layer =
      i < CORE_COUNT ? -1 : Math.min(layers - 1, Math.floor((i - CORE_COUNT) / perLayer));
    state.layer[i] = layer;
    state.u[i] = random();
    state.rank[i] = random();
    // Çekirdekte yarıçap (merkeze yoğun), katmanlarda eğriden küçük sapma
    state.jitter[i] =
      layer < 0 ? Math.abs((random() + random() + random() - 1.5) / 1.5) : random() * 2 - 1;
    state.phase[i] = random() * Math.PI * 2;
    state.size[i] = layer < 0 ? 0.6 + random() * 1.0 : 0.55 + random() * 1.15;
  }
  state.clock[ENERGY] = IDLE_ENERGY;
  return state;
}

// Bir katmandaki eğri üzerinde konum; sonuç (x, y) doğrudan çıktı tamponuna yazılır
function layerPoint(
  state: AvatarState,
  layer: number,
  u: number,
  t: number,
  out: Float32Array,
  o: number,
): void {
  'worklet';
  const base = LAYER_BASE + layer * LAYER_GAP;
  const tilt = (state.tilt[layer] ?? 0) + t * (state.spin[layer] ?? 0);
  let x: number;
  let y: number;
  if (state.shape === 1) {
    // Çiçek: r = R (0,55 + 0,45 cos kθ)
    const theta = u * Math.PI * 2;
    const r = base * (0.55 + 0.45 * Math.cos((state.lobes[layer] ?? 4) * theta));
    x = Math.cos(theta) * r;
    y = Math.sin(theta) * r;
  } else if (state.shape === 2) {
    // Kristal: çokgen kenarları boyunca, hafif nabız
    const sides = state.lobes[layer] ?? 4;
    const pos = u * sides;
    const edge = Math.floor(pos);
    const f = pos - edge;
    const radius = base * (1 + 0.04 * Math.sin(2 * t + layer));
    const a0 = (edge / sides) * Math.PI * 2;
    const a1 = ((edge + 1) / sides) * Math.PI * 2;
    x = (Math.cos(a0) * (1 - f) + Math.cos(a1) * f) * radius;
    y = (Math.sin(a0) * (1 - f) + Math.sin(a1) * f) * radius;
  } else {
    // Yörünge: basık elips
    const theta = u * Math.PI * 2;
    x = Math.cos(theta) * base;
    y = Math.sin(theta) * base * (state.squash[layer] ?? 0.5);
  }
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  out[o + OUT_X] = CENTER + x * c - y * s;
  out[o + OUT_Y] = CENTER + x * s + y * c;
}

export function stepAvatar(
  state: AvatarState,
  dt: number,
  targetEnergy: number,
  activeFraction: number,
  pointer?: Float32Array,
): void {
  'worklet';
  state.clock[CLOCK] = (state.clock[CLOCK] ?? 0) + dt;
  const t = state.clock[CLOCK] ?? 0;
  const e0 = state.clock[ENERGY] ?? IDLE_ENERGY;
  const energy = e0 + (targetEnergy - e0) * Math.min(1, dt * ENERGY_RATE);
  state.clock[ENERGY] = energy;
  const { out, layers } = state;
  // Görünen katman parçacığı oranı enerjiyle artar
  const visibleShare = (0.4 + 0.6 * energy) * activeFraction;
  const breathe = 1 + 0.14 * Math.sin(1.6 * t);

  for (let i = 0; i < state.count; i++) {
    const o = i * OUT_STRIDE;
    const layer = state.layer[i] ?? 0;
    const phase = state.phase[i] ?? 0;
    const rank = state.rank[i] ?? 0;
    let alpha: number;
    let colorT: number;

    if (layer < 0) {
      if (rank > activeFraction) {
        out[o + OUT_ALPHA] = 0;
        continue;
      }
      const angle = (state.u[i] ?? 0) * Math.PI * 2 + t * (0.4 + rank * 0.5);
      const r = (state.jitter[i] ?? 0) * CORE_RADIUS * breathe;
      out[o + OUT_X] = CENTER + Math.cos(angle) * r;
      out[o + OUT_Y] = CENTER + Math.sin(angle) * r;
      alpha = (0.35 + 0.5 * energy) * (0.7 + 0.3 * Math.sin(2.4 * t + phase));
      colorT = 0.5 + (state.jitter[i] ?? 0) * 0.15;
    } else {
      if (rank > visibleShare) {
        out[o + OUT_ALPHA] = 0;
        continue;
      }
      // Parçacıklar eğri boyunca akar
      const u = ((((state.u[i] ?? 0) + t * (state.flow[layer] ?? 0)) % 1) + 1) % 1;
      layerPoint(state, layer, u, t, out, o);
      // Eğriden hafif dalgalı sapma: canlı, el yapımı görünüm
      const wobble = (state.jitter[i] ?? 0) * (1.5 + 2.5 * energy) * Math.sin(1.3 * t + phase);
      const dx = (out[o + OUT_X] ?? CENTER) - CENTER;
      const dy = (out[o + OUT_Y] ?? CENTER) - CENTER;
      const len = Math.sqrt(dx * dx + dy * dy) + 0.001;
      out[o + OUT_X] = (out[o + OUT_X] ?? CENTER) + (dx / len) * wobble;
      out[o + OUT_Y] = (out[o + OUT_Y] ?? CENTER) + (dy / len) * wobble;
      alpha = (0.22 + 0.62 * energy) * (0.55 + 0.45 * Math.sin(3 * t + phase));
      colorT = (layers === 1 ? 0.6 : 0.12 + (0.8 * layer) / (layers - 1)) + (u - 0.5) * 0.08;
    }

    let scale = 1;
    if (pointer) {
      pointerField(out[o + OUT_X] ?? 0, out[o + OUT_Y] ?? 0, pointer, state.field);
      out[o + OUT_X] = (out[o + OUT_X] ?? 0) + (state.field[0] ?? 0);
      out[o + OUT_Y] = (out[o + OUT_Y] ?? 0) + (state.field[1] ?? 0);
      alpha += (state.field[2] ?? 0) * 0.6;
      scale += (state.field[2] ?? 0) * 0.6;
    }
    out[o + OUT_SIZE] = (state.size[i] ?? 1) * scale;
    out[o + OUT_ALPHA] = Math.max(0, Math.min(1, alpha));
    out[o + OUT_COLOR] = lutIndex(colorT);
  }
}

// "Hareketi azalt" için enerjiyi doğrudan hedefe al
export function settleAvatar(state: AvatarState, energy: number): void {
  'worklet';
  state.clock[ENERGY] = energy;
  stepAvatar(state, 0, energy, 1);
}
