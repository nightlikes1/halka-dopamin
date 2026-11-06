// Sürekli ileri-geri giden animasyon değeri: yalnızca ekran odakta ve uygulama öndeyken çalışır,
// "hareketi azalt" açıkken durur. Sekme arka plana geçince boşuna kare harcanmaz.
import { useEffect } from 'react';
import {
  cancelAnimation,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useLoopActive } from '@presentation/particles/renderer/useLoopActive';

export function useLoopValue(from: number, to: number, durationMs: number): SharedValue<number> {
  const reduced = useReducedMotion();
  const active = useLoopActive();
  const value = useSharedValue(from);
  const running = active && !reduced;

  useEffect(() => {
    if (!running) return undefined;
    // Yarıda kesildiyse genlik küçülmesin diye baştan başlar
    value.set(from);
    value.set(withRepeat(withTiming(to, { duration: durationMs }), -1, true));
    return () => cancelAnimation(value);
  }, [running, from, to, durationMs, value]);

  return value;
}
