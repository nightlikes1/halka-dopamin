// Animasyonlu ilerleme çubuğu: açılışta 0'dan (isteğe bağlı gecikmeyle) dolar;
// shimmer verilirse üzerinden periyodik beyaz bir parlama geçer.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { durations, easeOut } from '@core/theme/motion';
import { themedStyles } from '@core/theme/themed';
import { withAlpha } from '@core/theme/palettes';
import { useTheme } from '@core/theme/ThemeProvider';
import { colors, radius } from '@core/theme/tokens';

interface ProgressBarProps {
  readonly pct: number;
  readonly color?: string;
  readonly height?: number;
  // Açılışta dolmaya başlama gecikmesi (ms)
  readonly delay?: number;
  readonly duration?: number;
  readonly shimmer?: boolean;
}

const SHIMMER_CYCLE = 2800;
const SHIMMER_WIDTH = 60;

export function ProgressBar({
  pct,
  color,
  height = 8,
  delay = 0,
  duration = 450,
  shimmer = false,
}: ProgressBarProps) {
  const { palette } = useTheme();
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  const sweep = useSharedValue(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timing = withTiming(Math.max(0, Math.min(100, pct)), { duration, easing: easeOut });
    progress.value = delay ? withDelay(delay, timing) : timing;
  }, [pct, delay, duration, progress]);

  useEffect(() => {
    if (!shimmer || reduced) return;
    sweep.value = withRepeat(
      withSequence(
        withTiming(0, { duration: SHIMMER_CYCLE - durations.ringFill }),
        withTiming(1, { duration: durations.ringFill }),
      ),
      -1,
    );
  }, [shimmer, reduced, sweep]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -SHIMMER_WIDTH + sweep.value * (width + SHIMMER_WIDTH) }],
  }));

  return (
    <View
      style={[styles.track, { height }]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
    >
      <Animated.View
        style={[styles.fill, { backgroundColor: color ?? palette.accent }, fillStyle]}
      />
      {shimmer && !reduced ? (
        <Animated.View pointerEvents="none" style={[styles.shimmer, shimmerStyle]} />
      ) : null}
    </View>
  );
}

const styles = themedStyles(() => ({
  track: {
    width: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.full },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SHIMMER_WIDTH,
    backgroundColor: withAlpha(colors.textPrimary, '33'),
  },
}));
