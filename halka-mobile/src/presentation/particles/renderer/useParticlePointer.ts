// Ekranın dokunma/fare girdisini parçacık kanalına yazar. Olaylar yalnızca izlenir, sahiplenilmez:
// kaydırma ve butonlar normal çalışır. `handlers` olayları alacak (ata) görünüme, `targetRef`
// parçacık alanının köşesini belirleyen görünüme verilir; konumlar referans koordinata çevrilir.
// Mobilde dokunma olayları, web'de ayrıca fare (üzerinde gezinme = itme, tıklama = nabız) kullanılır.
import { useCallback, useMemo, useRef } from 'react';
import {
  Platform,
  type GestureResponderEvent,
  type PointerEvent,
  type View,
  type ViewProps,
} from 'react-native';
import { useReducedMotion, useSharedValue } from 'react-native-reanimated';
import { CHANNEL_SIZE } from '@presentation/particles/engine/interaction';
import { REFERENCE_WIDTH } from '@presentation/particles/engine/types';
import type { PointerChannel } from '@presentation/particles/renderer/types';

type PointerHandlers = Pick<
  ViewProps,
  | 'onTouchStart'
  | 'onTouchMove'
  | 'onTouchEnd'
  | 'onTouchCancel'
  | 'onPointerMove'
  | 'onPointerDown'
  | 'onPointerLeave'
>;

interface ParticlePointer {
  readonly channel: PointerChannel;
  readonly targetRef: React.RefObject<View | null>;
  readonly handlers: PointerHandlers;
}

interface Origin {
  x: number;
  y: number;
  scale: number;
}

const REMEASURE_MS = 500;
const IDLE: readonly number[] = new Array<number>(CHANNEL_SIZE).fill(0);

// onPulse: dokunuş anında (ör. hafif titreşim için)
export function useParticlePointer(
  referenceWidth: number = REFERENCE_WIDTH,
  onPulse?: () => void,
): ParticlePointer {
  const reduced = useReducedMotion();
  const channel = useSharedValue<readonly number[]>(IDLE);
  const targetRef = useRef<View | null>(null);
  const origin = useRef<Origin>({ x: 0, y: 0, scale: 1 });
  const serial = useRef(0);
  const measuredAt = useRef(0);

  const write = useCallback(
    (pageX: number, pageY: number, target: number, pulse: boolean) => {
      const { x, y, scale } = origin.current;
      const localX = (pageX - x) / scale;
      const localY = (pageY - y) / scale;
      const previous = channel.get();
      if (pulse) serial.current += 1;
      channel.set([
        localX,
        localY,
        target,
        pulse ? localX : (previous[3] ?? 0),
        pulse ? localY : (previous[4] ?? 0),
        serial.current,
      ]);
    },
    [channel],
  );

  // Alanın ekran konumu ölçülünce yazar (kaydırılan listede konum değişebilir)
  const measureThen = useCallback(
    (run: () => void) => {
      const target = targetRef.current;
      if (!target) {
        run();
        return;
      }
      target.measureInWindow((x, y, width) => {
        origin.current = { x, y, scale: width > 0 ? width / referenceWidth : 1 };
        measuredAt.current = Date.now();
        run();
      });
    },
    [referenceWidth],
  );

  const release = useCallback(() => {
    const previous = channel.get();
    channel.set([
      previous[0] ?? 0,
      previous[1] ?? 0,
      0,
      previous[3] ?? 0,
      previous[4] ?? 0,
      serial.current,
    ]);
  }, [channel]);

  const handlers = useMemo<PointerHandlers>(() => {
    if (reduced) return {};
    const fromTouch = (event: GestureResponderEvent) => event.nativeEvent;
    const touch: PointerHandlers = {
      onTouchStart: (event) => {
        const { pageX, pageY } = fromTouch(event);
        measureThen(() => write(pageX, pageY, 1, true));
        onPulse?.();
      },
      onTouchMove: (event) => {
        const { pageX, pageY } = fromTouch(event);
        write(pageX, pageY, 1, false);
      },
      onTouchEnd: release,
      onTouchCancel: release,
    };
    if (Platform.OS !== 'web') return touch;
    // Web: dokunmatik ekranlar dokunma olaylarıyla; fare ayrıca işaretçi olaylarıyla
    const isMouse = (event: PointerEvent) => event.nativeEvent.pointerType === 'mouse';
    return {
      ...touch,
      onPointerMove: (event) => {
        if (!isMouse(event)) return;
        const { pageX, pageY } = event.nativeEvent;
        // Konum yarım saniyede bir tazelenir (kaydırılan listede alan yer değiştirebilir)
        if (Date.now() - measuredAt.current > REMEASURE_MS) {
          measureThen(() => write(pageX, pageY, 1, false));
        } else {
          write(pageX, pageY, 1, false);
        }
      },
      onPointerDown: (event) => {
        if (!isMouse(event)) return;
        const { pageX, pageY } = event.nativeEvent;
        measureThen(() => write(pageX, pageY, 1, true));
        onPulse?.();
      },
      onPointerLeave: (event) => {
        if (isMouse(event)) release();
      },
    };
  }, [reduced, measureThen, write, release, onPulse]);

  return { channel, targetRef, handlers };
}
