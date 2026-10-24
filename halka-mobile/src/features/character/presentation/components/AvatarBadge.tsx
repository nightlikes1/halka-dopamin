// Avatar dairesi: arkada karakterin parçacık aurası (dokununca tepki verir), önde çizgi karakter.
// Çizgi karakter dokunmayı engellemez; dokunuşlar auraya geçer.
import { StyleSheet, View } from 'react-native';
import { colors } from '@core/theme/tokens';
import type { DiceBearAvatar } from '@features/character/domain/dicebear';
import type { AvatarLook, Mood } from '@features/character/domain/look';
import { CartoonAvatar } from '@features/character/presentation/components/CartoonAvatar';
import { DiceBearImage } from '@features/character/presentation/dicebear/DiceBearImage';
import { ParticleAvatar } from '@presentation/particles/components/ParticleAvatar';
import type { AvatarShapeKind } from '@presentation/particles/engine/avatarEngine';
import type { ParticlePaletteName } from '@presentation/particles/engine/palette';
import { themedStyles } from '@core/theme/themed';

const CARTOON_SCALE = 1.08;
const CARTOON_DROP = 0.06;
// DiceBear görseli kare; dairenin içinde kenarlara değmeden durur
const DICEBEAR_SCALE = 0.84;

export interface AvatarFigure {
  readonly shape: AvatarShapeKind;
  readonly palette: ParticlePaletteName;
  readonly layers: number;
  readonly seed: number;
}

interface AvatarBadgeProps {
  readonly figure: AvatarFigure;
  readonly look: AvatarLook;
  readonly mood: Mood;
  readonly size: number;
  // Aura canlılığı 0-1; bilinmiyorsa null
  readonly energy: number | null;
  // Web'de fps ölçümü için ad (aynı anda birden çok avatar olabilir)
  readonly name?: string;
  // DiceBear avatarı ve tohumu; yoksa kendi çizgi karakterimiz
  readonly dicebear?: DiceBearAvatar | null;
  readonly dicebearSeed?: string;
}

export function AvatarBadge({
  figure,
  look,
  mood,
  size,
  energy,
  name,
  dicebear,
  dicebearSeed = '',
}: AvatarBadgeProps) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <ParticleAvatar
        shape={figure.shape}
        palette={figure.palette}
        layers={figure.layers}
        seed={figure.seed}
        energy={energy}
        size={size}
        name={name}
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {dicebear ? (
          <View style={styles.center}>
            <DiceBearImage avatar={dicebear} seed={dicebearSeed} size={size * DICEBEAR_SCALE} />
          </View>
        ) : (
          // Büst dairenin dibinden biraz taşar; baş daire merkezinin biraz üstünde
          <CartoonAvatar
            look={look}
            mood={mood}
            size={size * CARTOON_SCALE}
            style={[styles.cartoon, { bottom: -size * CARTOON_DROP }]}
          />
        )}
      </View>
    </View>
  );
}

const styles = themedStyles(() => ({
  circle: { overflow: 'hidden', backgroundColor: colors.ink },
  cartoon: { position: 'absolute', alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
}));
