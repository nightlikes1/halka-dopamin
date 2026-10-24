// Zincir halkanın arkasındaki parçacık hale: Bugün'deki şampanya halka akışı, yarıçapı zincirle örtüşecek
// şekilde ölçeklenir. burstKey değişince halkanın ucundan kıvılcım çıkar. Katman dokunuş almaz
// (box-none); dokunma/sürükleme `pointer` kanalıyla, olayları dinleyen ata görünümden gelir.
import { useMemo, type Ref } from 'react';
import { View } from 'react-native';
import { themedStyles } from '@core/theme/themed';
import {
  HALO_DUST,
  HALO_REFERENCE_WIDTH,
  HALO_RING_RATIO,
  stepHalo,
} from '@presentation/particles/engine/haloEngine';
import { buildLut, type ParticlePaletteName } from '@presentation/particles/engine/palette';
import {
  consumeBurst,
  createRing,
  RING_COUNT,
  setRingProgress,
  syncBurst,
  type RingState,
} from '@presentation/particles/engine/ringEngine';
import { ParticleCanvas } from '@presentation/particles/renderer/ParticleCanvas';
import type { ParticleSim, PointerChannel } from '@presentation/particles/renderer/types';

const haloSim: ParticleSim<RingState> = {
  referenceWidth: HALO_REFERENCE_WIDTH,
  create: () => createRing(RING_COUNT, HALO_DUST),
  step: (state, dt, inputs, fraction, pointer) => {
    'worklet';
    consumeBurst(state, inputs[1] ?? 0);
    stepHalo(state, dt, inputs[0] ?? 0, fraction, pointer);
  },
  settle: (state, inputs) => {
    'worklet';
    setRingProgress(state, inputs[0] ?? 0);
    syncBurst(state, inputs[1] ?? 0);
    stepHalo(state, 0, inputs[0] ?? 0, 1);
  },
};

// Halka çizimlerinin yarıçap / kutu oranı (ChainRing: 200 / 500)
const CHAIN_RADIUS_RATIO = 0.4;

interface ParticleHaloProps {
  // Zincir halkanın kutu boyutu (px); hale bu kutuya ortalanır
  readonly size: number;
  readonly burstKey?: number;
  // 0-1; varsayılan tam halka
  readonly progress?: number;
  readonly palette?: ParticlePaletteName;
  readonly pointer?: PointerChannel;
  // useParticlePointer'ın targetRef'i (dokunuş konumu bu pencereye göre çevrilir)
  readonly targetRef?: Ref<View>;
}

export function ParticleHalo({
  size,
  burstKey = 0,
  progress = 1,
  palette = 'buzAtes',
  pointer,
  targetRef,
}: ParticleHaloProps) {
  const lut = useMemo(() => buildLut(palette), [palette]);
  const inputs = useMemo(() => [progress, burstKey], [progress, burstKey]);
  // Parçacık halkasının yarıçapı = zincirin yarıçapı
  const side = (size * CHAIN_RADIUS_RATIO) / HALO_RING_RATIO;
  const offset = (size - side) / 2;

  return (
    <View
      ref={targetRef}
      style={[styles.layer, { width: side, height: side, left: offset, top: offset }]}
      pointerEvents="box-none"
    >
      <ParticleCanvas sim={haloSim} inputs={inputs} lut={lut} name="halo" pointer={pointer} />
    </View>
  );
}

const styles = themedStyles(() => ({
  layer: { position: 'absolute' },
}));
