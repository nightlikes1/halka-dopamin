// Parçacık dalga: perspektifli nokta arazisi. intensity 1 (sayaç çalışıyor) → güçlü dalga,
// 0 → sakin (genlik 0,4). Mod paletiyle renklenir.
import { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { buildLut, type ParticlePaletteName } from '@presentation/particles/engine/palette';
import {
  createWave,
  stepWave,
  WAVE_IDLE_AMP,
  WAVE_RUNNING_AMP,
  type WaveState,
} from '@presentation/particles/engine/waveEngine';
import { ParticleCanvas } from '@presentation/particles/renderer/ParticleCanvas';
import type { ParticleSim, PointerChannel } from '@presentation/particles/renderer/types';

const waveSim: ParticleSim<WaveState> = {
  create: () => createWave(),
  step: (state, dt, inputs, fraction, pointer) => {
    'worklet';
    stepWave(state, dt, inputs[0] ?? WAVE_IDLE_AMP, fraction, pointer);
  },
  settle: (state, inputs) => {
    'worklet';
    // Genliği doğrudan hedefe al (dt büyük → tek adımda yakınsar)
    stepWave(state, 1, inputs[0] ?? WAVE_IDLE_AMP, 1);
  },
};

interface ParticleWaveProps {
  // 0-1: sayaç çalışırken 1
  readonly intensity: number;
  readonly palette?: ParticlePaletteName;
  // useParticlePointer kanalı: dokunuş yüzeyde dalgacık yaratır
  readonly pointer?: PointerChannel;
  readonly style?: StyleProp<ViewStyle>;
}

export function ParticleWave({
  intensity,
  palette = 'buzAtes',
  pointer,
  style,
}: ParticleWaveProps) {
  const lut = useMemo(() => buildLut(palette), [palette]);
  const amp = WAVE_IDLE_AMP + (WAVE_RUNNING_AMP - WAVE_IDLE_AMP) * intensity;
  const inputs = useMemo(() => [amp], [amp]);
  return (
    <View style={[styles.fill, style]} pointerEvents="none">
      <ParticleCanvas sim={waveSim} inputs={inputs} lut={lut} name="wave" pointer={pointer} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill },
});
