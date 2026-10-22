// Parçacık avatar: karakterin kimliğinden ve özelliklerinden üretilen canlı figür.
// Dokununca nabız (+ hafif titreşim), sürükleyince parçacıklar itilir. Enerji = yakınlık (0-1).
import { useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import {
  AVATAR_REF,
  createAvatar,
  IDLE_ENERGY,
  settleAvatar,
  stepAvatar,
  type AvatarShapeKind,
  type AvatarState,
} from '@presentation/particles/engine/avatarEngine';
import { buildLut, type ParticlePaletteName } from '@presentation/particles/engine/palette';
import { ParticleCanvas } from '@presentation/particles/renderer/ParticleCanvas';
import type { ParticleSim } from '@presentation/particles/renderer/types';
import { useParticlePointer } from '@presentation/particles/renderer/useParticlePointer';
import { hapticLight } from '@presentation/utils/haptics';

interface ParticleAvatarProps {
  readonly shape: AvatarShapeKind;
  readonly palette: ParticlePaletteName;
  // Özellik sayısı (katman sayısı)
  readonly layers: number;
  // Karakterden türetilen tohum (avatarSeed)
  readonly seed: number;
  // Yakınlık 0-1; bilinmiyorsa null (sakin hal)
  readonly energy: number | null;
  // Ekrandaki kenar uzunluğu (px)
  readonly size: number;
  // Ekranlarda birden çok avatar olursa ölçüm adı
  readonly name?: string;
  readonly style?: StyleProp<ViewStyle>;
}

export function ParticleAvatar({
  shape,
  palette,
  layers,
  seed,
  energy,
  size,
  name = 'avatar',
  style,
}: ParticleAvatarProps) {
  const lut = useMemo(() => buildLut(palette), [palette]);
  const inputs = useMemo(() => [energy ?? IDLE_ENERGY], [energy]);
  const { channel, targetRef, handlers } = useParticlePointer(AVATAR_REF, hapticLight);

  // Biçim/katman/tohum değişince yeni figür kurulur
  const sim = useMemo<ParticleSim<AvatarState>>(
    () => ({
      referenceWidth: AVATAR_REF,
      create: () => createAvatar({ shape, layers, seed }),
      step: (state, dt, values, fraction, ptr) => {
        'worklet';
        stepAvatar(state, dt, values[0] ?? IDLE_ENERGY, fraction, ptr);
      },
      settle: (state, values) => {
        'worklet';
        settleAvatar(state, values[0] ?? IDLE_ENERGY);
      },
    }),
    [shape, layers, seed],
  );

  return (
    <View ref={targetRef} style={[{ width: size, height: size }, style]} {...handlers}>
      <ParticleCanvas sim={sim} inputs={inputs} lut={lut} name={name} pointer={channel} />
    </View>
  );
}
