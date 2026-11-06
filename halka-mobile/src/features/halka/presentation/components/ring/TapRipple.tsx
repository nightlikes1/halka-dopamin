// Halkaya dokunulan noktada su damlası gibi yayılan iki ince halka. Bir kez oynar, sonra kare harcamaz.
// Tekrar oynatmak için üst bileşen `key` değiştirir.
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { withAlpha } from '@core/theme/palettes';
import { themedStyles } from '@core/theme/themed';
import { colors } from '@core/theme/tokens';

const RIPPLE_SIZE = 150;
const RIPPLE_DURATION = 700;
const SECOND_RING_DELAY = 140;
const MIN_SCALE = 0.08;
const PEAK_OPACITY = 0.7;

function RippleRing({ delay }: { readonly delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withDelay(
        delay,
        withTiming(1, { duration: RIPPLE_DURATION, easing: Easing.out(Easing.quad) }),
      ),
    );
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value === 0 ? 0 : (1 - progress.value) * PEAK_OPACITY,
    transform: [{ scale: MIN_SCALE + progress.value * (1 - MIN_SCALE) }],
  }));

  return <Animated.View style={[styles.ring, style]} />;
}

interface TapRippleProps {
  readonly x: number;
  readonly y: number;
}

export function TapRipple({ x, y }: TapRippleProps) {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <View
      style={[styles.box, { left: x - RIPPLE_SIZE / 2, top: y - RIPPLE_SIZE / 2 }]}
      pointerEvents="none"
    >
      <RippleRing delay={0} />
      <RippleRing delay={SECOND_RING_DELAY} />
    </View>
  );
}

const styles = themedStyles(() => ({
  box: { position: 'absolute', width: RIPPLE_SIZE, height: RIPPLE_SIZE },
  ring: {
    position: 'absolute',
    width: RIPPLE_SIZE,
    height: RIPPLE_SIZE,
    borderRadius: RIPPLE_SIZE / 2,
    borderWidth: 1,
    borderColor: withAlpha(colors.textPrimary, 'cc'),
  },
}));
