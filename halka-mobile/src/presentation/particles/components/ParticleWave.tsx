// Parçacık dalga: perspektifli nokta arazisi. intensity 1 (sayaç çalışıyor) → güçlü dalga,
// 0 → sakin (genlik 0,4). Mod paletiyle renklenir. Arazi kutunun tabanına sabitlenir: kutunun
// en-boy oranı motora verilir (geniş web/masaüstü ekranda dalga ekranın altına taşmaz).
import { useMemo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { buildLut, type ParticlePaletteName } from '@presentation/particles/engine/palette';
import {
  createWave,
  stepWave,
  WAVE_IDLE_AMP,
  WAVE_RUNNING_AMP,
  type WaveState,
} from '@presentation/particles/engine/waveEngine';
import { REFERENCE_WIDTH } from '@presentation/particles/engine/types';
import { ParticleCanvas } from '@presentation/particles/renderer/ParticleCanvas';
import type { ParticleSim, PointerChannel } from '@presentation/particles/renderer/types';
import { themedStyles } from '@core/theme/themed';

const waveSim: ParticleSim<WaveState> = {
  create: () => createWave(),
  step: (state, dt, inputs, fraction, pointer) => {
    'worklet';
    stepWave(state, dt, inputs[0] ?? WAVE_IDLE_AMP, fraction, pointer, inputs[1] ?? 0);
  },
  settle: (state, inputs) => {
    'worklet';
    // Genliği doğrudan hedefe al (dt büyük → tek adımda yakınsar)
    stepWave(state, 1, inputs[0] ?? WAVE_IDLE_AMP, 1, undefined, inputs[1] ?? 0);
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
  // Kutunun yüksekliği çizici referans biriminde (genişlik REFERENCE_WIDTH); ölçülene kadar 0 = varsayılan
  const [viewHeight, setViewHeight] = useState(0);
  const inputs = useMemo(() => [amp, viewHeight], [amp, viewHeight]);
  return (
    <View
      style={[styles.fill, style]}
      pointerEvents="none"
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        if (width > 0) setViewHeight((height * REFERENCE_WIDTH) / width);
      }}
    >
      <ParticleCanvas sim={waveSim} inputs={inputs} lut={lut} name="wave" pointer={pointer} />
    </View>
  );
}

const styles = themedStyles(() => ({
  fill: { ...StyleSheet.absoluteFill },
}));
