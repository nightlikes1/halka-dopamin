// Sağa kaydırarak tamamla: satır parmağı izler, arkada renkli onay alanı açılır; eşik aşılırsa
// bırakınca onComplete çağrılır (tamamlanmış satırda geri alma). Yalnızca belirgin yatay sağa
// kaydırma yakalanır; dikey kaydırma ve satırdaki butonlar normal çalışır. Ek paket yok (PanResponder).
import { useMemo, type ReactNode } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { themedStyles } from '@core/theme/themed';
import { withAlpha } from '@core/theme/palettes';
import { colors, radius, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { Icon } from '@presentation/components/common/Icon';
import { hapticLight } from '@presentation/utils/haptics';
import { SWIPE_ROW_TEST_ID } from '@presentation/utils/webGlobalStyles';

// Kaydırma eşiği ve en fazla kayma (px)
const THRESHOLD = 88;
const MAX_SHIFT = 140;
const START_SLOP = 10;
const SPRING = { damping: 18, stiffness: 220, overshootClamping: true } as const;

interface SwipeToCompleteProps {
  readonly children: ReactNode;
  readonly done: boolean;
  readonly color: string;
  readonly label: string;
  readonly onComplete: () => void;
  readonly enabled?: boolean;
  // İçerideki kartın köşe yarıçapı (arka alan aynı biçimde açılır)
  readonly cornerRadius?: number;
}

export function SwipeToComplete({
  children,
  done,
  color,
  label,
  onComplete,
  enabled = true,
  cornerRadius = radius.glass,
}: SwipeToCompleteProps) {
  const reduced = useReducedMotion();
  const shift = useSharedValue(0);
  const reveal = useSharedValue(0);
  // Eşik geçildi mi (ref yerine shared value: React Compiler render içi ref erişimine izin vermez)
  const crossed = useSharedValue(false);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          enabled && gesture.dx > START_SLOP && gesture.dx > Math.abs(gesture.dy) * 1.5,
        onPanResponderGrant: () => {
          crossed.set(false);
        },
        onPanResponderMove: (_event, gesture) => {
          const dx = Math.max(0, Math.min(MAX_SHIFT, gesture.dx));
          shift.set(dx);
          reveal.set(Math.min(1, dx / THRESHOLD));
          // Eşik geçilince bir kez titreşim: bırakınca işleneceğini hissettirir
          if (dx >= THRESHOLD && !crossed.get()) {
            crossed.set(true);
            hapticLight();
          } else if (dx < THRESHOLD) {
            crossed.set(false);
          }
        },
        onPanResponderRelease: (_event, gesture) => {
          if (gesture.dx >= THRESHOLD) onComplete();
          shift.set(reduced ? 0 : withSpring(0, SPRING));
          reveal.set(reduced ? 0 : withTiming(0, { duration: 250 }));
        },
        onPanResponderTerminate: () => {
          shift.set(withSpring(0, SPRING));
          reveal.set(withTiming(0, { duration: 250 }));
        },
        // Kaydırma başladıysa liste (dikey kaydırma) devralamaz
        onPanResponderTerminationRequest: () => false,
      }),
    [enabled, onComplete, reduced, shift, reveal, crossed],
  );

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shift.value }] }));
  const backStyle = useAnimatedStyle(() => ({ opacity: reveal.value }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.7 + 0.3 * reveal.value }],
  }));

  return (
    <View style={{ borderRadius: cornerRadius }}>
      <Animated.View
        style={[
          styles.back,
          { backgroundColor: withAlpha(color, '33'), borderRadius: cornerRadius },
          backStyle,
        ]}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        aria-hidden
      >
        <Animated.View style={iconStyle}>
          <Icon name={done ? 'rotate-ccw' : 'check'} size={20} color={color} />
        </Animated.View>
        <AppText variant="label" style={{ color }}>
          {label}
        </AppText>
      </Animated.View>
      <Animated.View style={rowStyle} testID={SWIPE_ROW_TEST_ID} {...responder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = themedStyles(() => ({
  back: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
}));
