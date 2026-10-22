// Parçacık girdabı: karşılama ekranı arka planı. Ortada yumuşak kenarlı kara delik.
// Koordinatlar 390 genişlik referansına göre ekran genişliğiyle orantılı ölçeklenir.
import { useMemo } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { PARTICLE_BACKGROUND } from '@presentation/particles/config';
import { buildLut, type ParticlePaletteName } from '@presentation/particles/engine/palette';
import { REFERENCE_HEIGHT, REFERENCE_WIDTH } from '@presentation/particles/engine/types';
import {
  createVortex,
  stepVortex,
  VORTEX_CX,
  VORTEX_CY,
  VORTEX_HOLE,
  type VortexState,
} from '@presentation/particles/engine/vortexEngine';
import { ParticleCanvas } from '@presentation/particles/renderer/ParticleCanvas';
import type { ParticleSim, PointerChannel } from '@presentation/particles/renderer/types';

const HOLE_INNER = VORTEX_HOLE - 10;
const HOLE_OUTER = VORTEX_HOLE + 12;

const vortexSim: ParticleSim<VortexState> = {
  create: () => createVortex(),
  step: (state, dt, _inputs, fraction, pointer) => {
    'worklet';
    stepVortex(state, dt, Math.floor(state.count * fraction), pointer);
  },
  settle: (state) => {
    'worklet';
    stepVortex(state, 0, state.count);
  },
};

const NO_INPUTS: readonly number[] = [];

interface ParticleVortexProps {
  readonly palette?: ParticlePaletteName;
  // useParticlePointer kanalı: dokunma/fare parçacıkları iter
  readonly pointer?: PointerChannel;
  readonly style?: StyleProp<ViewStyle>;
}

export function ParticleVortex({ palette = 'buzAtes', pointer, style }: ParticleVortexProps) {
  const lut = useMemo(() => buildLut(palette), [palette]);
  const { width } = useWindowDimensions();
  const height = (width / REFERENCE_WIDTH) * REFERENCE_HEIGHT;

  return (
    <View style={[styles.fill, style]} pointerEvents="none">
      <ParticleCanvas
        sim={vortexSim}
        inputs={NO_INPUTS}
        lut={lut}
        name="vortex"
        pointer={pointer}
      />
      {/* Kara delik: içi tam siyah, kenarı yumuşak */}
      <Svg
        style={styles.overlay}
        width={width}
        height={height}
        viewBox={`0 0 ${REFERENCE_WIDTH} ${REFERENCE_HEIGHT}`}
      >
        <Defs>
          <RadialGradient
            id="hole"
            cx={VORTEX_CX}
            cy={VORTEX_CY}
            r={HOLE_OUTER}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset={0} stopColor={PARTICLE_BACKGROUND} stopOpacity={1} />
            <Stop
              offset={HOLE_INNER / HOLE_OUTER}
              stopColor={PARTICLE_BACKGROUND}
              stopOpacity={1}
            />
            <Stop offset={1} stopColor={PARTICLE_BACKGROUND} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={VORTEX_CX} cy={VORTEX_CY} r={HOLE_OUTER} fill="url(#hole)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill },
  overlay: { position: 'absolute', top: 0, left: 0 },
});
