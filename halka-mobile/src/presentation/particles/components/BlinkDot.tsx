// Yanıp sönen küçük nokta (etiket ve görev pill'leri). "Hareketi azalt" açıkken sabit.
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const CYCLE = 1400;

interface BlinkDotProps {
  readonly color: string;
  readonly size?: number;
}

export function BlinkDot({ color, size = 8 }: BlinkDotProps) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    opacity.set(
      withRepeat(
        withSequence(
          withTiming(0.25, { duration: CYCLE / 2 }),
          withTiming(1, { duration: CYCLE / 2 }),
        ),
        -1,
      ),
    );
  }, [reduced, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    />
  );
}
