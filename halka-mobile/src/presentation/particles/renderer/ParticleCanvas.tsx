// Mobil çizici (iOS/Android): Skia Atlas ile tüm parçacıklar tek çizim çağrısında, toplamsal karışımla.
// Simülasyon Reanimated useFrameCallback ile UI thread'de ilerler; tamponlar önceden ayrılır,
// karelerde nesne yaratılmaz. Web'de ParticleCanvas.web.tsx kullanılır (Skia web yüklenmez).
import {
  Atlas,
  Canvas,
  Circle,
  RadialGradient,
  Skia,
  useColorBuffer,
  useRSXformBuffer,
  useTexture,
  vec,
} from '@shopify/react-native-skia';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFrameCallback, useReducedMotion, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';
import { colors, fonts } from '@core/theme/tokens';
import {
  FPS_SAMPLE_FRAMES,
  LOW_POWER_FRACTION,
  MAX_FRAME_DT,
  MIN_TARGET_FPS,
  PARTICLE_INTENSITY,
  PARTICLE_ON_LIGHT,
  SPRITE_SIZE,
  SPRITE_SPREAD,
} from '@presentation/particles/config';
import {
  OUT_ALPHA,
  OUT_COLOR,
  OUT_SIZE,
  OUT_STRIDE,
  OUT_X,
  OUT_Y,
  REFERENCE_WIDTH,
  type ParticleOutput,
} from '@presentation/particles/engine/types';
import {
  advancePointer,
  CHANNEL_SIZE,
  createPointerBuffer,
} from '@presentation/particles/engine/interaction';
import { createPace, paceFrame } from '@presentation/particles/renderer/pacing';
import type { ParticleCanvasProps } from '@presentation/particles/renderer/types';
import { useLoopActive } from '@presentation/particles/renderer/useLoopActive';

const HALF = SPRITE_SIZE / 2;
const SPRITE_RECT = Skia.XYWHRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

// Kare hızı göstergesi yalnızca geliştirme modunda (telefonda ölçüm için)
const SHOW_FPS = __DEV__;
const IDLE_CHANNEL: readonly number[] = new Array<number>(CHANNEL_SIZE).fill(0);

export function ParticleCanvas<S extends ParticleOutput>({
  sim,
  inputs,
  lut,
  name,
  pointer,
  style,
}: ParticleCanvasProps<S>) {
  const reduced = useReducedMotion();
  const active = useLoopActive();
  const [width, setWidth] = useState(0);
  const [fps, setFps] = useState<number | null>(null);

  // Simülasyon durumu JS'te bir kez oluşturulur, UI runtime'a bir kez kopyalanır
  const initial = useMemo(() => sim.create(), [sim]);
  // Worklet'lere yalnızca worklet fonksiyonları geçsin
  const { step, settle } = sim;
  const count = initial.count;
  const state = useSharedValue(initial);
  const input = useSharedValue<readonly number[]>(inputs);
  const palette = useSharedValue(lut);
  const scale = useSharedValue(1);
  const tick = useSharedValue(0);
  const fraction = useSharedValue(1);
  // [ölçülen kare, toplam süre, saniyelik kare, saniyelik süre]
  const meter = useSharedValue([0, 0, 0, 0]);
  // 90/120 Hz ekranlarda fazla kareler atlanır: iş yükü 60 Hz ile aynı kalır
  const pace = useSharedValue(createPace());
  // Dokunma: ekranın kanalı (yoksa boş yerel kanal) + UI tarafında yumuşatılan tampon
  const idleChannel = useSharedValue<readonly number[]>(IDLE_CHANNEL);
  const channel = pointer ?? idleChannel;
  const pointerState = useSharedValue(createPointerBuffer());
  const referenceWidth = sim.referenceWidth ?? REFERENCE_WIDTH;

  // Simülasyon değişince (ör. avatar biçimi) yeni durum UI tarafına aktarılır
  useEffect(() => {
    state.set(initial);
  }, [initial, state]);

  useEffect(() => {
    input.set(inputs);
  }, [inputs, input]);
  useEffect(() => {
    palette.set(lut);
  }, [lut, palette]);
  useEffect(() => {
    scale.set(width / referenceWidth);
  }, [width, referenceWidth, scale]);

  const reportFps = (value: number) => setFps(value);

  const frame = useFrameCallback((info) => {
    'worklet';
    const elapsed = paceFrame(pace.value, (info.timeSincePreviousFrame ?? 16) / 1000);
    if (elapsed === 0) return;
    // Ölçüm gerçek süreyle, simülasyon sınırlı adımla
    const dt = Math.min(MAX_FRAME_DT, elapsed);
    advancePointer(pointerState.value, channel.value, dt);
    step(state.value, dt, input.value, fraction.value, pointerState.value);
    tick.value += 1;

    // İlk karelerde kare hızını ölç; düşükse parçacık sayısını azalt
    const m = meter.value;
    if ((m[0] ?? 0) < FPS_SAMPLE_FRAMES) {
      m[0] = (m[0] ?? 0) + 1;
      m[1] = (m[1] ?? 0) + elapsed;
      if (m[0] === FPS_SAMPLE_FRAMES && FPS_SAMPLE_FRAMES / (m[1] ?? 1) < MIN_TARGET_FPS) {
        fraction.value = LOW_POWER_FRACTION;
      }
    }
    if (SHOW_FPS) {
      m[2] = (m[2] ?? 0) + 1;
      m[3] = (m[3] ?? 0) + elapsed;
      if ((m[3] ?? 0) >= 1) {
        scheduleOnRN(reportFps, Math.round((m[2] ?? 0) / (m[3] ?? 1)));
        m[2] = 0;
        m[3] = 0;
      }
    }
  }, false);

  const running = active && !reduced;
  useEffect(() => {
    frame.setActive(running);
  }, [running, frame]);

  // Hareketi azalt: tek seferde son duruma getir ve sabit çiz
  useEffect(() => {
    if (!reduced) return;
    // Girdiler argüman olarak geçer (UI tarafındaki kopya henüz güncellenmemiş olabilir)
    scheduleOnUI((values: readonly number[]) => {
      'worklet';
      settle(state.value, values);
      tick.value += 1;
    }, inputs);
  }, [reduced, inputs, settle, state, tick]);

  const transforms = useRSXformBuffer(count, (xf, i) => {
    'worklet';
    // tick okunarak her karede yeniden hesaplanır
    if (tick.value < 0) return;
    const out = state.value.out;
    const o = i * OUT_STRIDE;
    const s = scale.value;
    const k = ((out[o + OUT_SIZE] ?? 0) * SPRITE_SPREAD * s) / SPRITE_SIZE;
    xf.set(k, 0, (out[o + OUT_X] ?? 0) * s - HALF * k, (out[o + OUT_Y] ?? 0) * s - HALF * k);
  });

  const tints = useColorBuffer(count, (color, i) => {
    'worklet';
    if (tick.value < 0) return;
    const out = state.value.out;
    const table = palette.value;
    const o = i * OUT_STRIDE;
    const c = (out[o + OUT_COLOR] ?? 0) * 3;
    color[0] = (table[c] ?? 0) / 255;
    color[1] = (table[c + 1] ?? 0) / 255;
    color[2] = (table[c + 2] ?? 0) / 255;
    color[3] = Math.max(0, Math.min(1, out[o + OUT_ALPHA] ?? 0)) * PARTICLE_INTENSITY;
  });

  const texture = useTexture(
    <Circle cx={HALF} cy={HALF} r={HALF}>
      <RadialGradient
        c={vec(HALF, HALF)}
        r={HALF}
        colors={['white', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
        positions={[0, 0.3, 1]}
      />
    </Circle>,
    { width: SPRITE_SIZE, height: SPRITE_SIZE },
  );

  const sprites = useMemo(() => new Array(count).fill(SPRITE_RECT), [count]);

  return (
    <View
      style={[styles.fill, style]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Canvas style={styles.fill}>
        <Atlas
          image={texture}
          sprites={sprites}
          transforms={transforms}
          colors={tints}
          colorBlendMode="modulate"
          blendMode={PARTICLE_ON_LIGHT ? 'srcOver' : 'plus'}
        />
      </Canvas>
      {SHOW_FPS && fps !== null ? (
        <Text style={styles.fps}>
          {name} {fps} fps
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  fps: {
    position: 'absolute',
    top: 4,
    left: 4,
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textDim,
  },
});
