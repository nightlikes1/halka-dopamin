// Web: SVG veri adresi düz bir <img> ile çizilir (tarayıcının kendi SVG motoru; en doğru sonuç).
// react-native-web'in Image bileşeni SVG veri adresini yükleyemiyor (boş kalıyor), bu yüzden DOM öğesi.
import { useMemo } from 'react';
import { View } from 'react-native';
import type { DiceBearImageProps } from '@features/character/presentation/dicebear/DiceBearImage';
import { diceBearSvg } from '@features/character/presentation/dicebear/registry';

export function DiceBearImage({ avatar, seed, size, style }: DiceBearImageProps) {
  const uri = useMemo(
    () => `data:image/svg+xml;utf8,${encodeURIComponent(diceBearSvg(avatar, seed))}`,
    [avatar, seed],
  );
  return (
    <View style={style}>
      <img src={uri} width={size} height={size} alt="" draggable={false} />
    </View>
  );
}
