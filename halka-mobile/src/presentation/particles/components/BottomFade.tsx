// Ekranın alt kısmında şeffaftan zemine yumuşak geçiş (parçacıkların üstünde metin okunabilsin)
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { particleBackground } from '@presentation/particles/config';
import { themedStyles } from '@core/theme/themed';

interface BottomFadeProps {
  // Ekran yüksekliğine oran (0-1)
  readonly fraction: number;
  readonly color?: string;
}

export function BottomFade({ fraction, color = particleBackground() }: BottomFadeProps) {
  return (
    <View style={[styles.fade, { height: `${fraction * 100}%` }]} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset={0} stopColor={color} stopOpacity={0} />
            <Stop offset={0.55} stopColor={color} stopOpacity={0.85} />
            <Stop offset={1} stopColor={color} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bottomFade)" />
      </Svg>
    </View>
  );
}

const styles = themedStyles(() => ({
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
}));
