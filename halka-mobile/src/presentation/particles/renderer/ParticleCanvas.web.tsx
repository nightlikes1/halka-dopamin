// Web çizici: düz HTML <canvas> 2D + requestAnimationFrame, toplamsal karışım ("lighter").
// Skia'nın web modülü (CanvasKit ~3 MB) yüklenmez. Renkli yumuşak noktalar bir kez sprite
// sayfasına çizilir; her karede yalnızca drawImage çağrılır, nesne yaratılmaz.
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import {
  FPS_SAMPLE_FRAMES,
  LOW_POWER_FRACTION,
  MAX_FRAME_DT,
  MAX_PIXEL_RATIO,
  MIN_TARGET_FPS,
  PARTICLE_INTENSITY,
  SPRITE_SIZE,
  SPRITE_SPREAD,
} from '@presentation/particles/config';
import { LUT_SIZE } from '@presentation/particles/engine/palette';
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

declare global {
  // Playwright ile ölçüm için: ad → son saniyedeki kare sayısı, adFraction → çizilen parçacık oranı
  var __halkaParticleFps: Record<string, number> | undefined;
}

const HALF = SPRITE_SIZE / 2;
const IDLE_CHANNEL: readonly number[] = new Array<number>(CHANNEL_SIZE).fill(0);

// Palet değişince yeniden üretilen sprite sayfası: her renk için bir yumuşak nokta
function buildSpriteSheet(lut: Float32Array): HTMLCanvasElement {
  const sheet = document.createElement('canvas');
  const cells = LUT_SIZE + 1;
  sheet.width = cells * SPRITE_SIZE;
  sheet.height = SPRITE_SIZE;
  const ctx = sheet.getContext('2d');
  if (!ctx) return sheet;
  for (let i = 0; i < cells; i++) {
    const r = Math.round(lut[i * 3] ?? 0);
    const g = Math.round(lut[i * 3 + 1] ?? 0);
    const b = Math.round(lut[i * 3 + 2] ?? 0);
    const cx = i * SPRITE_SIZE + HALF;
    const gradient = ctx.createRadialGradient(cx, HALF, 0, cx, HALF, HALF);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
    gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.55)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(i * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE);
  }
  return sheet;
}

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const state = useMemo(() => sim.create(), [sim]);
  const sheet = useMemo(() => buildSpriteSheet(lut), [lut]);
  const pointerState = useMemo(() => createPointerBuffer(), []);
  const referenceWidth = sim.referenceWidth ?? REFERENCE_WIDTH;
  // Döngü içinde en güncel girdiler okunur (döngüyü yeniden kurmadan)
  const inputsRef = useRef(inputs);
  useEffect(() => {
    inputsRef.current = inputs;
  }, [inputs]);
  // Hareketi azalt açıkken girdiler değişince sabit kare yeniden çizilir (döngü yok)
  const staticInputs = reduced ? inputs : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || size.width === 0) return undefined;

    const ratio = Math.min(MAX_PIXEL_RATIO, globalThis.devicePixelRatio || 1);
    canvas.width = Math.round(size.width * ratio);
    canvas.height = Math.round(size.height * ratio);
    const scale = (size.width / referenceWidth) * ratio;

    const draw = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.globalCompositeOperation = 'lighter';
      const out = state.out;
      for (let i = 0; i < state.count; i++) {
        const o = i * OUT_STRIDE;
        const alpha = out[o + OUT_ALPHA] ?? 0;
        if (alpha <= 0.004) continue;
        const d = (out[o + OUT_SIZE] ?? 0) * SPRITE_SPREAD;
        ctx.globalAlpha = (alpha > 1 ? 1 : alpha) * PARTICLE_INTENSITY;
        ctx.drawImage(
          sheet,
          (out[o + OUT_COLOR] ?? 0) * SPRITE_SIZE,
          0,
          SPRITE_SIZE,
          SPRITE_SIZE,
          (out[o + OUT_X] ?? 0) - d / 2,
          (out[o + OUT_Y] ?? 0) - d / 2,
          d,
          d,
        );
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    // Hareketi azalt ya da ekran görünmez: tek sabit kare
    if (reduced || !active) {
      if (reduced) sim.settle(state, staticInputs ?? inputsRef.current);
      draw();
      return undefined;
    }

    let frameId = 0;
    let last = 0;
    let fraction = 1;
    let sampled = 0;
    let sampledTime = 0;
    let fpsFrames = 0;
    let fpsTime = 0;
    const pace = createPace();
    const loop = (now: number) => {
      frameId = requestAnimationFrame(loop);
      const raw = last === 0 ? 1 / 60 : (now - last) / 1000;
      last = now;
      // Yüksek tazeleme hızında fazla kareler atlanır (en fazla ~60 fps)
      const elapsed = paceFrame(pace, raw);
      if (elapsed === 0) return;
      // Ölçüm gerçek süreyle, simülasyon sınırlı adımla
      const dt = Math.min(MAX_FRAME_DT, elapsed);
      advancePointer(pointerState, pointer?.value ?? IDLE_CHANNEL, dt);
      sim.step(state, dt, inputsRef.current, fraction, pointerState);
      draw();
      if (sampled < FPS_SAMPLE_FRAMES) {
        sampled += 1;
        sampledTime += elapsed;
        if (sampled === FPS_SAMPLE_FRAMES && FPS_SAMPLE_FRAMES / sampledTime < MIN_TARGET_FPS) {
          fraction = LOW_POWER_FRACTION;
        }
      }
      fpsFrames += 1;
      fpsTime += elapsed;
      if (fpsTime >= 1) {
        globalThis.__halkaParticleFps = {
          ...globalThis.__halkaParticleFps,
          [name]: Math.round(fpsFrames / fpsTime),
          [`${name}Fraction`]: fraction,
        };
        fpsFrames = 0;
        fpsTime = 0;
      }
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [
    size,
    sheet,
    state,
    sim,
    reduced,
    active,
    name,
    staticInputs,
    pointer,
    pointerState,
    referenceWidth,
  ]);

  return (
    <View
      style={[styles.fill, style]}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setSize({ width, height });
      }}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <canvas ref={canvasRef} style={canvasStyle} aria-hidden />
    </View>
  );
}

const canvasStyle = { width: '100%', height: '100%', display: 'block' } as const;

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
