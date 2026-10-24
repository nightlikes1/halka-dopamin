// 💧 Su Takibi
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { themedStyles } from '@core/theme/themed';
import { withAlpha } from '@core/theme/palettes';
import { colors, fonts, fontSizes, radius, spacing } from '@core/theme/tokens';
import { WATER_FOCUSED_AMOUNTS, WATER_QUICK_AMOUNTS } from '@domain/entities/Water';
import { getCatalogItem } from '@domain/entities/WidgetCatalog';
import { AppText } from '@presentation/components/common/AppText';
import { Chip } from '@presentation/components/common/Chip';
import { IconButton } from '@presentation/components/common/IconButton';
import type { WidgetBodyProps } from '@presentation/components/widgets/types';
import { widgetStyles } from '@presentation/components/widgets/widgetStyles';
import { useWater } from '@presentation/hooks/useWater';
import { widgetAccentColor } from '@presentation/components/widgets/widgetAccent';

const accent = () => widgetAccentColor(getCatalogItem('water').accent);

export function WaterWidget({ variant }: WidgetBodyProps) {
  const { water, progress, add, reset } = useWater();
  const focused = variant === 'focused';
  const amounts = focused ? WATER_FOCUSED_AMOUNTS : WATER_QUICK_AMOUNTS;
  const statusText = progress.isGoalReached
    ? focused
      ? 'Hedef Tamamlandı!'
      : 'Hedef Başarıldı!'
    : `${progress.remaining} ml kaldı`;

  const fill = useSharedValue(progress.pct);
  const shimmer = useSharedValue(0.75);

  useEffect(() => {
    fill.value = withTiming(progress.pct, { duration: 600 });
  }, [progress.pct, fill]);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1800 }), -1, true);
  }, [shimmer]);

  const fillStyle = useAnimatedStyle(() => ({ height: `${fill.value}%`, opacity: shimmer.value }));

  const gauge = (
    <View
      style={[styles.gauge, focused ? styles.gaugeFocused : styles.gaugeCompact]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: progress.pct }}
    >
      <Animated.View style={[styles.fill, fillStyle]} />
      <View style={styles.gaugeText}>
        {focused ? (
          <>
            <AppText style={styles.focusedPct}>%{progress.pct}</AppText>
            <AppText style={styles.gaugeSub}>{statusText}</AppText>
          </>
        ) : (
          <>
            <AppText style={styles.amount}>{water.current}</AppText>
            <AppText style={styles.gaugeSub}>/ {water.target} ml</AppText>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={focused ? widgetStyles.containerFocused : widgetStyles.container}>
      {focused ? (
        <View style={styles.hero}>
          {gauge}
          <View style={styles.bubbles}>
            <View style={widgetStyles.bubble}>
              <AppText style={widgetStyles.bubbleValue}>{water.current}</AppText>
              <AppText style={widgetStyles.bubbleLabel}>İçilen (ml)</AppText>
            </View>
            <View style={widgetStyles.bubble}>
              <AppText style={widgetStyles.bubbleValue}>{water.target}</AppText>
              <AppText style={widgetStyles.bubbleLabel}>Günlük Hedef</AppText>
            </View>
          </View>
        </View>
      ) : (
        <View style={widgetStyles.row}>
          {gauge}
          <View style={styles.stats}>
            <AppText style={[styles.pct, { color: accent() }]}>%{progress.pct}</AppText>
            <AppText variant="muted">{statusText}</AppText>
          </View>
        </View>
      )}

      <View style={widgetStyles.wrapRow}>
        {amounts.map((amount) => (
          <Chip
            key={amount}
            label={`+${amount} ml`}
            variant={amount === 250 ? 'primary' : 'default'}
            accent={accent()}
            onPress={() => void add(amount)}
          />
        ))}
        {focused ? (
          <Chip label="Sıfırla" icon="rotate-ccw" onPress={() => void reset()} />
        ) : (
          <IconButton
            icon="rotate-ccw"
            accessibilityLabel="Sıfırla"
            onPress={() => void reset()}
            size={36}
          />
        )}
      </View>
    </View>
  );
}

const styles = themedStyles(() => ({
  gauge: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: withAlpha(accent(), '55'),
    backgroundColor: colors.fillSubtle,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  gaugeCompact: { width: 96, height: 120 },
  gaugeFocused: { width: 170, height: 210, alignSelf: 'center' },
  // Koyu yarı saydam dolgu: üstteki beyaz metin her doluluk oranında okunur
  fill: {
    width: '100%',
    backgroundColor: withAlpha(accent(), '40'),
    borderTopWidth: 2,
    borderTopColor: accent(),
  },
  gaugeText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  amount: { fontFamily: fonts.mono, fontSize: fontSizes.xl, color: colors.textMain },
  focusedPct: { fontFamily: fonts.mono, fontSize: fontSizes.xxl, color: colors.textMain },
  gaugeSub: { fontSize: fontSizes.xs, color: colors.textMain, textAlign: 'center' },
  stats: { flex: 1, gap: spacing.xs },
  pct: { fontFamily: fonts.bold, fontSize: fontSizes.xxl },
  hero: { gap: spacing.lg },
  bubbles: { flexDirection: 'row', gap: spacing.md },
}));
