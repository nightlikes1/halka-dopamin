// Liquid Glass arka planı: zeminde bulanık renk lekeleri (turuncu, mor, lacivert, yeşil). Yalnızca
// süs; dokunmayı engellemez, ekran okuyucuya görünmez. Renkler aktif moddan (backdropBlobs).
import { useId } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { backdropBlobs } from '@core/theme/tokens';

export function GlassBackdrop() {
  const { width, height } = useWindowDimensions();
  const id = useId().replace(/:/g, '');
  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={width} height={height}>
        <Defs>
          {backdropBlobs.map((blob, index) => (
            <RadialGradient key={index} id={`gb${id}${index}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={blob.color} />
              <Stop offset="1" stopColor={blob.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {backdropBlobs.map((blob, index) => (
          <Circle
            key={index}
            cx={blob.x * width}
            cy={blob.y * height}
            r={blob.r * width}
            fill={`url(#gb${id}${index})`}
          />
        ))}
      </Svg>
    </View>
  );
}
