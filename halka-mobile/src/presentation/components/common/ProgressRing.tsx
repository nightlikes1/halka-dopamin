// İlerleme halkası: bir ya da iç içe birden çok halka (viewBox 200). Halkalar 12 yönünden başlar,
// uçları yuvarlaktır; değer ve renk değişimi animasyonludur. Ortaya içerik (children) konabilir.
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { durations, easeOut } from '@core/theme/motion';
import { colors } from '@core/theme/tokens';
import { themedStyles } from '@core/theme/themed';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const VIEWBOX = 200;
const CENTER = VIEWBOX / 2;

export interface RingSpec {
  // 0-1 arası doluluk
  readonly progress: number;
  readonly color: string;
  readonly radius: number;
  readonly strokeWidth: number;
  readonly trackColor?: string;
  // Açılışta 0'dan dolarken gecikme (ms)
  readonly delay?: number;
}

interface ProgressRingProps {
  readonly size: number;
  readonly rings: readonly RingSpec[];
  // Dolma süresi (ms); sayaç gibi sürekli değişen değerlerde 'linear' kullanılır
  readonly duration?: number;
  readonly linear?: boolean;
  readonly children?: ReactNode;
  readonly accessibilityLabel?: string;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function Ring({
  spec,
  duration,
  linear,
}: {
  readonly spec: RingSpec;
  readonly duration: number;
  readonly linear: boolean;
}) {
  const circumference = 2 * Math.PI * spec.radius;
  const progress = useSharedValue(0);
  // Renk geçişi: önceki renkten yenisine 0-1
  const colorFrom = useSharedValue(spec.color);
  const colorTo = useSharedValue(spec.color);
  const colorMix = useSharedValue(1);

  useEffect(() => {
    const target = clamp01(spec.progress);
    const timing = withTiming(target, {
      duration,
      easing: linear ? Easing.linear : easeOut,
    });
    progress.value = spec.delay ? withDelay(spec.delay, timing) : timing;
  }, [spec.progress, spec.delay, duration, linear, progress]);

  useEffect(() => {
    if (colorTo.value === spec.color) return;
    colorFrom.value = colorTo.value;
    colorTo.value = spec.color;
    colorMix.value = 0;
    colorMix.value = withTiming(1, { duration: durations.colorChange });
  }, [spec.color, colorFrom, colorTo, colorMix]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
    // %0'da yuvarlak uç tek nokta olarak görünmesin
    strokeOpacity: progress.value > 0.001 ? 1 : 0,
    stroke: interpolateColor(colorMix.value, [0, 1], [colorFrom.value, colorTo.value]),
  }));

  return (
    <>
      <Circle
        cx={CENTER}
        cy={CENTER}
        r={spec.radius}
        stroke={spec.trackColor ?? colors.track}
        strokeWidth={spec.strokeWidth}
        fill="none"
      />
      <AnimatedCircle
        cx={CENTER}
        cy={CENTER}
        r={spec.radius}
        strokeWidth={spec.strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        fill="none"
        // 12 yönünden başlasın
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
        animatedProps={animatedProps}
      />
    </>
  );
}

export function ProgressRing({
  size,
  rings,
  duration = durations.ringFill,
  linear = false,
  children,
  accessibilityLabel,
}: ProgressRingProps) {
  return (
    <View
      style={{ width: size, height: size }}
      accessible={accessibilityLabel !== undefined}
      accessibilityRole={accessibilityLabel ? 'progressbar' : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
        {rings.map((spec, index) => (
          <Ring key={index} spec={spec} duration={duration} linear={linear} />
        ))}
      </Svg>
      {children ? (
        <View style={styles.center} pointerEvents="box-none">
          {children}
        </View>
      ) : null}
    </View>
  );
}

const styles = themedStyles(() => ({
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
}));
