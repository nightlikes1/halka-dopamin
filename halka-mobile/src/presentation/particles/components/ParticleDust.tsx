// Tüm ekrana yayılan ortam tozu: içeriğin arkasında, dokunuş almaz. Ekran yüksekliği simülasyona
// girdi olarak verilir (toz görünen alanın tamamında döner). Tema renkleri buildLut'tan gelir.
import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { themedStyles } from '@core/theme/themed';
import { createDust, stepDust, type DustState } from '@presentation/particles/engine/dustEngine';
import { buildLut, type ParticlePaletteName } from '@presentation/particles/engine/palette';
import { REFERENCE_WIDTH } from '@presentation/particles/engine/types';
import { ParticleCanvas } from '@presentation/particles/renderer/ParticleCanvas';
import type { ParticleSim } from '@presentation/particles/renderer/types';

const dustSim: ParticleSim<DustState> = {
  create: () => createDust(),
  step: (state, dt, inputs, fraction) => {
    'worklet';
    stepDust(state, dt, inputs[0] ?? 0, fraction);
  },
  settle: (state, inputs) => {
    'worklet';
    stepDust(state, 0, inputs[0] ?? 0, 1);
  },
};

interface ParticleDustProps {
  readonly palette?: ParticlePaletteName;
}

export function ParticleDust({ palette = 'buzAtes' }: ParticleDustProps) {
  const lut = useMemo(() => buildLut(palette), [palette]);
  const { width, height } = useWindowDimensions();
  // Görünen yükseklik referans birimde
  const inputs = useMemo(() => [(height * REFERENCE_WIDTH) / Math.max(1, width)], [width, height]);

  return (
    <View style={styles.fill} pointerEvents="none">
      <ParticleCanvas sim={dustSim} inputs={inputs} lut={lut} name="dust" />
    </View>
  );
}

const styles = themedStyles(() => ({
  fill: { ...StyleSheet.absoluteFill },
}));
