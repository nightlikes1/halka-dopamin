// Odak ekranı: seçilen eklentinin geniş görünümü (web'de halkanın içinde açılan odak paneli)
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { withAlpha } from '@core/theme/palettes';
import { colors, fonts, fontSizes, radius, spacing } from '@core/theme/tokens';
import { getCatalogItem } from '@domain/entities/WidgetCatalog';
import { AppText } from '@presentation/components/common/AppText';
import { Icon } from '@presentation/components/common/Icon';
import { WIDGET_ICONS } from '@presentation/components/common/iconMaps';
import { ChainRing } from '@presentation/components/ring/ChainRing';
import { WidgetBody } from '@presentation/components/widgets/WidgetBody';
import { useSoundEffect } from '@presentation/hooks/useSoundEffect';
import type { RootStackScreenProps } from '@presentation/navigation/types';
import { useUiStore } from '@presentation/store/useUiStore';

const MAX_CONTENT_WIDTH = 640;

export function WidgetFocusScreen({ route, navigation }: RootStackScreenProps<'WidgetFocus'>) {
  const { widgetId } = route.params;
  const item = getCatalogItem(widgetId);
  const { width } = useWindowDimensions();
  const pulseKey = useUiStore((s) => s.ringPulseKey);
  const pulseRing = useUiStore((s) => s.pulseRing);
  const play = useSoundEffect();
  const ringSize = Math.min(width - spacing.lg * 2, 520);

  // Girişte yükselen, çıkışta alçalan ses + halka nabzı
  useEffect(() => {
    play('focusZoom');
    pulseRing();
    return () => play('focusExit');
  }, [play, pulseRing]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.headerBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Halka genel görünümüne dön"
          hitSlop={8}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <AppText style={styles.backText}>{"Halka'ya Dön"}</AppText>
        </Pressable>
        <View
          style={[
            styles.badge,
            {
              borderColor: withAlpha(item.accent, '66'),
              backgroundColor: withAlpha(item.accent, '1a'),
            },
          ]}
        >
          <Icon name={WIDGET_ICONS[widgetId]} size={16} color={item.accent} />
          <AppText style={[styles.badgeName, { color: item.accent }]} numberOfLines={1}>
            {item.name}
          </AppText>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.stage}>
          {/* Giriş animasyonu opaklığı ezmesin diye soluk görünüm içteki View'da */}
          <Animated.View entering={FadeIn.duration(500)} style={styles.ringBackdrop}>
            <View style={styles.ringDim}>
              <ChainRing size={ringSize} pulseKey={pulseKey} />
            </View>
          </Animated.View>
          <Animated.View
            entering={ZoomIn.duration(380)}
            style={[styles.panel, { borderColor: withAlpha(item.accent, '33') }]}
          >
            <WidgetBody id={widgetId} variant="focused" />
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  backText: { fontFamily: fonts.semibold, fontSize: fontSizes.sm },
  pressed: { opacity: 0.6 },
  badge: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  badgeName: { fontFamily: fonts.semibold, fontSize: fontSizes.sm },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, alignItems: 'center' },
  stage: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignItems: 'center' },
  ringBackdrop: { position: 'absolute', top: 0 },
  ringDim: { opacity: 0.35 },
  panel: {
    width: '100%',
    marginTop: spacing.xxl,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.scrim,
  },
});
