// Canlı halka: turuncu→pembe→mor gradyanlı ilerleme halkası. Sakin günde 6 sn'lik yavaş nefes ve
// yumuşak parıltı, hareketli günde daha hızlı ve keskin atım. "Hareketi azalt" açıksa sabit durur.
import { useEffect, useId, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { durations, easeOut } from '@core/theme/motion';
import { colors, gradients } from '@core/theme/tokens';
import { withAlpha } from '@core/theme/palettes';
import { themedStyles } from '@core/theme/themed';
import type { RingMood } from '@features/today/domain/dayRules';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const VIEWBOX = 200;
const CENTER = VIEWBOX / 2;
const RADIUS = 84;
const STROKE = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Nefes süreleri (bir yarım döngü, ms) ve büyüme oranı
const BREATH = { calm: 3000, lively: 900 } as const;
const SCALE = { calm: 1.025, lively: 1.04 } as const;

interface LiveRingProps {
  readonly size: number;
  readonly progress: number; // 0-1
  readonly mood: RingMood;
  readonly children?: ReactNode;
  readonly accessibilityLabel?: string;
  // Kutlama gibi tek seferlik kullanımda nefes yok
  readonly still?: boolean;
}

export function LiveRing({
  size,
  progress,
  mood,
  children,
  accessibilityLabel,
  still = false,
}: LiveRingProps) {
  const id = useId().replace(/:/g, '');
  const reduced = useReducedMotion();
  const fill = useSharedValue(0);
  const breath = useSharedValue(0);

  useEffect(() => {
    const target = Math.max(0, Math.min(1, progress));
    fill.value = reduced
      ? target
      : withTiming(target, { duration: durations.ringFill, easing: easeOut });
  }, [progress, reduced, fill]);

  useEffect(() => {
    if (reduced || still) {
      cancelAnimation(breath);
      breath.value = 0;
      return;
    }
    const half = BREATH[mood];
    const easing = mood === 'calm' ? Easing.inOut(Easing.sin) : Easing.out(Easing.quad);
    breath.value = 0;
    breath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: half, easing }),
        withTiming(0, { duration: half, easing }),
      ),
      -1,
    );
    return () => cancelAnimation(breath);
  }, [mood, reduced, still, breath]);

  const scale = SCALE[mood];
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + (scale - 1) * breath.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.35 + 0.5 * breath.value }));
  const strokeProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - fill.value),
    strokeOpacity: fill.value > 0.001 ? 1 : 0,
  }));

  const stops = gradients.ring;
  const glowColor = withAlpha(stops[0] ?? colors.gold, '26');

  return (
    <View
      style={{ width: size, height: size }}
      accessible={accessibilityLabel !== undefined}
      accessibilityRole={accessibilityLabel ? 'progressbar' : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.glow, { borderRadius: size / 2, backgroundColor: glowColor }, glowStyle]}
      />
      <Animated.View style={[styles.fill, ringStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
          <Defs>
            <LinearGradient id={`lr${id}`} x1="0" y1="0" x2="1" y2="1">
              {stops.map((color, index) => (
                <Stop
                  key={`${color}-${index}`}
                  offset={stops.length > 1 ? index / (stops.length - 1) : 0}
                  stopColor={color}
                />
              ))}
            </LinearGradient>
          </Defs>
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={colors.track}
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={`url(#lr${id})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            fill="none"
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            animatedProps={strokeProps}
          />
        </Svg>
      </Animated.View>
      <View style={styles.center} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = themedStyles(() => ({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  glow: { position: 'absolute', top: '8%', right: '8%', bottom: '8%', left: '8%' },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
