// Geniş ekran (tablet) kokpit düzeni: sol kanat | halka | sağ kanat + bağlantı çizgileri
import { useCallback, useMemo, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { spacing } from '@core/theme/tokens';
import type { WidgetId } from '@domain/entities/WidgetId';
import { TetherOverlay, type Point } from '@presentation/components/layout/TetherOverlay';
import { RingSection } from '@presentation/components/ring/RingSection';
import { WidgetCard } from '@presentation/components/widgets/WidgetCard';
import { themedStyles } from '@core/theme/themed';

interface Frame {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface CardFrame {
  readonly y: number;
  readonly height: number;
}

type WingKey = 'left' | 'center' | 'right';

interface CockpitLayoutProps {
  readonly ids: readonly WidgetId[];
  readonly ringSize: number;
  readonly onAddPress: () => void;
}

const toFrame = (event: LayoutChangeEvent): Frame => {
  const { x, y, width, height } = event.nativeEvent.layout;
  return { x, y, width, height };
};

export function CockpitLayout({ ids, ringSize, onAddPress }: CockpitLayoutProps) {
  // Yarısı sol, yarısı sağ kanada (web ile aynı dağılım)
  const half = Math.ceil(ids.length / 2);
  const leftIds = ids.slice(0, half);
  const rightIds = ids.slice(half);

  const [frames, setFrames] = useState<Partial<Record<WingKey, Frame>>>({});
  const [cards, setCards] = useState<Partial<Record<WidgetId, CardFrame>>>({});

  const onWingLayout = (key: WingKey) => (event: LayoutChangeEvent) => {
    const frame = toFrame(event);
    setFrames((previous) => ({ ...previous, [key]: frame }));
  };

  const onCardLayout = useCallback((id: WidgetId, frame: CardFrame) => {
    setCards((previous) => ({ ...previous, [id]: frame }));
  }, []);

  const center = useMemo<Point | null>(() => {
    const frame = frames.center;
    return frame ? { x: frame.x + frame.width / 2, y: frame.y + ringSize / 2 } : null;
  }, [frames.center, ringSize]);

  const targets = useMemo<Point[]>(() => {
    const result: Point[] = [];
    const collect = (
      wingIds: readonly WidgetId[],
      wing: Frame | undefined,
      side: 'left' | 'right',
    ) => {
      if (!wing) return;
      wingIds.forEach((id) => {
        const card = cards[id];
        if (!card) return;
        result.push({
          x: side === 'left' ? wing.x + wing.width : wing.x,
          y: wing.y + card.y + Math.min(card.height / 2, 60),
        });
      });
    };
    collect(leftIds, frames.left, 'left');
    collect(rightIds, frames.right, 'right');
    return result;
  }, [cards, frames.left, frames.right, leftIds, rightIds]);

  return (
    <View style={styles.row}>
      <TetherOverlay center={center} startRadius={ringSize * 0.43} targets={targets} />
      <View style={styles.wing} onLayout={onWingLayout('left')}>
        {leftIds.map((id, index) => (
          <WidgetCard key={id} id={id} index={index} onLayoutChange={onCardLayout} />
        ))}
      </View>
      <View style={styles.center} onLayout={onWingLayout('center')}>
        <RingSection size={ringSize} onAddPress={onAddPress} />
      </View>
      <View style={styles.wing} onLayout={onWingLayout('right')}>
        {rightIds.map((id, index) => (
          <WidgetCard key={id} id={id} index={half + index} onLayoutChange={onCardLayout} />
        ))}
      </View>
    </View>
  );
}

const styles = themedStyles(() => ({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xxl },
  wing: { flex: 1, gap: spacing.lg },
  center: { alignItems: 'center' },
}));
