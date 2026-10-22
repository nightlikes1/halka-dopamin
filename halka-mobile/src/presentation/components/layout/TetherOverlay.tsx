// Halka ile kanatlardaki kartlar arasındaki kesikli enerji bağları (web'deki #orbital-tethers).
// Web'deki getBoundingClientRect yerine onLayout ölçümleri kullanılır.
import { StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { useTheme } from '@core/theme/ThemeProvider';

export interface Point {
  readonly x: number;
  readonly y: number;
}

interface TetherOverlayProps {
  readonly center: Point | null;
  readonly startRadius: number;
  readonly targets: readonly Point[];
}

export function TetherOverlay({ center, startRadius, targets }: TetherOverlayProps) {
  const { palette } = useTheme();
  if (!center || targets.length === 0) return null;

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      {targets.map((target) => {
        const dx = target.x - center.x;
        const dy = target.y - center.y;
        const distance = Math.hypot(dx, dy);
        if (distance <= startRadius) return null;
        const startX = center.x + (dx / distance) * startRadius;
        const startY = center.y + (dy / distance) * startRadius;
        const key = `${Math.round(target.x)}-${Math.round(target.y)}`;
        return [
          <Line
            key={`line-${key}`}
            x1={startX}
            y1={startY}
            x2={target.x}
            y2={target.y}
            stroke={palette.tether}
            strokeWidth={2}
            strokeDasharray="5 7"
          />,
          <Circle key={`node-${key}`} cx={target.x} cy={target.y} r={3} fill={palette.accent} />,
        ];
      })}
    </Svg>
  );
}
