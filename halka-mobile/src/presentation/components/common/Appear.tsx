// Belirme animasyonu: 'up' aşağıdan 14 px yükselerek, 'pop' yaylı zıplayarak, 'rise' 18 px
// yükselip bulanıklıktan netleşerek (bulanıklık yalnızca web'de: iOS desteklemez, Android'de orta segment
// telefonlarda pahalı; oralarda yalnız yükselme) görünür.
// Reanimated'ın entering düzen animasyonu yerine shared value kullanır: web'de sonradan
// eklenen öğeler akıştan çıkmaz. "Hareketi azalt" açıksa doğrudan görünür.
import { useEffect, type ReactNode } from 'react';
import { Platform, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { durations, easeOut, ENTER_OFFSET } from '@core/theme/motion';

const RISE_DURATION = 900;
const RISE_OFFSET = 18;
const RISE_BLUR = 8;

interface AppearProps {
  readonly children: ReactNode;
  readonly delay?: number;
  readonly variant?: 'up' | 'pop' | 'rise';
  readonly style?: StyleProp<ViewStyle>;
}

export function Appear({ children, delay = 0, variant = 'up', style }: AppearProps) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 1 : 0);
  const blurSupported = Platform.OS === 'web';

  useEffect(() => {
    if (reduced) return;
    const animation =
      variant === 'pop'
        ? withSpring(1, { damping: 9, stiffness: 180 })
        : withTiming(1, {
            duration: variant === 'rise' ? RISE_DURATION : durations.enter,
            easing: easeOut,
          });
    progress.set(withDelay(delay, animation));
  }, [reduced, delay, variant, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const value = progress.value;
    if (variant === 'pop') {
      return { opacity: Math.min(1, value * 2), transform: [{ scale: 0.6 + value * 0.4 }] };
    }
    if (variant === 'rise') {
      return {
        opacity: value,
        transform: [{ translateY: (1 - value) * RISE_OFFSET }],
        // Reanimated web filtreyi dizi biçiminde bekler; sonda 0 bulanıklık
        ...(blurSupported ? { filter: [{ blur: (1 - value) * RISE_BLUR }] } : null),
      };
    }
    return { opacity: value, transform: [{ translateY: (1 - value) * ENTER_OFFSET }] };
  });

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
