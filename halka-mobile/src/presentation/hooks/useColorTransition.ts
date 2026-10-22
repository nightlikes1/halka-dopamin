// Renk değişince önceki renkten yenisine 0,25 sn'de geçen animasyonlu renk stili (zemin ya da kenarlık)
import { useEffect } from 'react';
import {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { durations } from '@core/theme/motion';

export function useColorTransition(
  color: string,
  property: 'backgroundColor' | 'borderColor' = 'backgroundColor',
) {
  const from = useSharedValue(color);
  const to = useSharedValue(color);
  const mix = useSharedValue(1);

  useEffect(() => {
    if (to.get() === color) return;
    from.set(to.get());
    to.set(color);
    mix.set(0);
    mix.set(withTiming(1, { duration: durations.colorChange }));
  }, [color, from, to, mix]);

  return useAnimatedStyle(() => ({
    [property]: interpolateColor(mix.value, [0, 1], [from.value, to.value]),
  }));
}
