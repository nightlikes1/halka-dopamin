// Basınca hafifçe küçülen dokunulabilir alan (0.92). Tüm yeni butonların temeli.
import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { durations, PRESS_SCALE } from '@core/theme/motion';

interface ScalePressableProps extends Omit<PressableProps, 'style' | 'children'> {
  readonly children: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  // Dıştaki dokunma alanının stili (ör. satırda flex: 1 ile eşit pay)
  readonly containerStyle?: StyleProp<ViewStyle>;
}

export function ScalePressable({
  children,
  style,
  containerStyle,
  onPressIn,
  onPressOut,
  ...rest
}: ScalePressableProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={containerStyle}
      onPressIn={(event) => {
        scale.set(withTiming(PRESS_SCALE, { duration: durations.press }));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.set(withTiming(1, { duration: durations.press }));
        onPressOut?.(event);
      }}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
