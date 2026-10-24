// Parçacık halka: üstten saat yönünde ilerleme. burstKey her değiştiğinde halkanın ucundan
// kıvılcım patlaması olur. Ortaya içerik (yüzde, etiket) konabilir.
import { useMemo, type ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { buildLut, type ParticlePaletteName } from '@presentation/particles/engine/palette';
import {
  consumeBurst,
  createRing,
  RING_CX,
  RING_CY,
  setRingProgress,
  stepRing,
  syncBurst,
  type RingState,
} from '@presentation/particles/engine/ringEngine';
import { REFERENCE_WIDTH } from '@presentation/particles/engine/types';
import { ParticleCanvas } from '@presentation/particles/renderer/ParticleCanvas';
import type { ParticleSim } from '@presentation/particles/renderer/types';
import { themedStyles } from '@core/theme/themed';
import { useParticlePointer } from '@presentation/particles/renderer/useParticlePointer';
import { hapticLight } from '@presentation/utils/haptics';

// Halka ve tozun kapladığı referans yükseklik (merkez RING_CY)
export const RING_AREA_HEIGHT = RING_CY * 2;

const ringSim: ParticleSim<RingState> = {
  create: () => createRing(),
  step: (state, dt, inputs, fraction, pointer) => {
    'worklet';
    consumeBurst(state, inputs[1] ?? 0);
    stepRing(state, dt, inputs[0] ?? 0, fraction, pointer);
  },
  settle: (state, inputs) => {
    'worklet';
    setRingProgress(state, inputs[0] ?? 0);
    syncBurst(state, inputs[1] ?? 0);
    stepRing(state, 0, inputs[0] ?? 0, 1);
  },
};

interface ParticleRingProps {
  // 0-1
  readonly progress: number;
  // Değiştiğinde kıvılcım patlaması
  readonly burstKey?: number;
  readonly palette?: ParticlePaletteName;
  readonly children?: ReactNode;
  readonly accessibilityLabel?: string;
}

export function ParticleRing({
  progress,
  burstKey = 0,
  palette = 'buzAtes',
  children,
  accessibilityLabel,
}: ParticleRingProps) {
  const lut = useMemo(() => buildLut(palette), [palette]);
  const inputs = useMemo(() => [progress, burstKey], [progress, burstKey]);
  const { width } = useWindowDimensions();
  const scale = Math.min(width, 640) / REFERENCE_WIDTH;
  const boxWidth = REFERENCE_WIDTH * scale;
  const boxHeight = RING_AREA_HEIGHT * scale;
  // Dokununca halkada nabız, sürükleyince parçacıklar itilir (kaydırmayı engellemez)
  const { channel, targetRef, handlers } = useParticlePointer(REFERENCE_WIDTH, hapticLight);

  return (
    <View
      ref={targetRef}
      {...handlers}
      style={[styles.box, { width: boxWidth, height: boxHeight }]}
      accessible={accessibilityLabel !== undefined}
      accessibilityRole={accessibilityLabel ? 'progressbar' : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      <ParticleCanvas sim={ringSim} inputs={inputs} lut={lut} name="ring" pointer={channel} />
      <View
        style={[
          styles.center,
          {
            left: (RING_CX - 100) * scale,
            top: (RING_CY - 100) * scale,
            width: 200 * scale,
            height: 200 * scale,
          },
        ]}
        pointerEvents="box-none"
      >
        {children}
      </View>
    </View>
  );
}

const styles = themedStyles(() => ({
  box: { alignSelf: 'center' },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
}));
