// 32 parçalı birbirine geçen zincir halka (web'deki ring.js'in react-native-svg karşılığı).
// CSS filtreleri (feDropShadow) yerine kaydırılmış koyu kontur ile gölge verilir.
import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line, Rect } from 'react-native-svg';
import { useTheme } from '@core/theme/ThemeProvider';

const VIEWBOX = 500;
const CENTER = 250;
const RADIUS = 200;
const LINK_COUNT = 32;
const ROTATION_MS = 120_000;

interface LinkGeometry {
  readonly key: number;
  readonly transform: string;
  readonly isFlat: boolean;
}

// Halka geometrisi sabittir; bir kez hesaplanır
const LINKS: readonly LinkGeometry[] = Array.from({ length: LINK_COUNT }, (_, i) => {
  const angle = (2 * Math.PI * i) / LINK_COUNT;
  const x = CENTER + RADIUS * Math.cos(angle);
  const y = CENTER + RADIUS * Math.sin(angle);
  const deg = (angle * 180) / Math.PI + 90;
  return {
    key: i,
    transform: `translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${deg.toFixed(2)})`,
    isFlat: i % 2 === 0,
  };
});

interface ChainRingProps {
  readonly size: number;
  readonly pulseKey?: number;
  readonly spinning?: boolean;
}

export const ChainRing = memo(function ChainRing({
  size,
  pulseKey = 0,
  spinning = true,
}: ChainRingProps) {
  const { palette } = useTheme();

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  // Yavaş, sonsuz dönüş
  useEffect(() => {
    if (!spinning) return undefined;
    rotation.value = withRepeat(
      withTiming(360, { duration: ROTATION_MS, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(rotation);
  }, [spinning, rotation]);

  // Etkileşimde elastik nabız + enerji parlaması
  useEffect(() => {
    if (pulseKey === 0) return;
    scale.value = withSequence(
      withTiming(1.04, { duration: 140 }),
      withTiming(0.98, { duration: 140 }),
      withSpring(1, { damping: 8 }),
    );
    glow.value = withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 600 }));
  }, [pulseKey, scale, glow]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  const links = useMemo(
    () =>
      LINKS.map((link) =>
        link.isFlat ? (
          <G key={link.key} transform={link.transform}>
            <Rect
              x={-19}
              y={-9}
              width={38}
              height={18}
              rx={9}
              fill="none"
              stroke={palette.metalLight}
              strokeWidth={3}
            />
            <Circle cx={0} cy={0} r={1.5} fill={palette.accent} opacity={0.7} />
          </G>
        ) : (
          <G key={link.key} transform={link.transform}>
            <Rect
              x={-12}
              y={-10}
              width={24}
              height={20}
              rx={5}
              fill="none"
              stroke={palette.metalDark}
              strokeWidth={3}
            />
            <Line x1={-8} y1={0} x2={8} y2={0} stroke={palette.metalDeep} strokeWidth={2} />
          </G>
        ),
      ),
    [palette.accent, palette.metalLight, palette.metalDark, palette.metalDeep],
  );

  const glowInset = (size * (CENTER - RADIUS)) / VIEWBOX;

  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, ringStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={palette.glow}
            strokeWidth={12}
            strokeDasharray="6 8"
          />
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS + 18}
            fill="none"
            stroke={palette.orbitTrack}
            strokeWidth={1.5}
            strokeDasharray="4 14"
          />
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS - 18}
            fill="none"
            stroke={palette.orbitTrack}
            strokeWidth={1.5}
            strokeDasharray="2 10"
          />

          <G>{links}</G>
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.glow,
          {
            top: glowInset,
            left: glowInset,
            right: glowInset,
            bottom: glowInset,
            borderRadius: size,
            borderColor: palette.accent,
          },
          glowStyle,
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    borderWidth: 1,
  },
});
