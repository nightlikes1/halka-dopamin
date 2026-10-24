// Eklenti kartı: başlık (odaklan / küçült / sil) + gövde; giriş/çıkış animasyonlu
import { useNavigation } from '@react-navigation/native';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, LinearTransition, ZoomOut } from 'react-native-reanimated';
import { themedStyles } from '@core/theme/themed';
import { withAlpha } from '@core/theme/palettes';
import { colors, fonts, fontSizes, radius, spacing } from '@core/theme/tokens';
import { getCatalogItem } from '@domain/entities/WidgetCatalog';
import type { WidgetId } from '@domain/entities/WidgetId';
import { AppText } from '@presentation/components/common/AppText';
import { Icon } from '@presentation/components/common/Icon';
import { WIDGET_ICONS } from '@presentation/components/common/iconMaps';
import { IconButton } from '@presentation/components/common/IconButton';
import { WidgetBody } from '@presentation/components/widgets/WidgetBody';
import { getWidgetSummary } from '@presentation/components/widgets/widgetSummary';
import { useLayout } from '@presentation/hooks/useLayout';
import { useNow } from '@presentation/hooks/useNow';
import { useSoundEffect } from '@presentation/hooks/useSoundEffect';
import { useHalkaStore } from '@presentation/store/useHalkaStore';
import { useUiStore } from '@presentation/store/useUiStore';
import { nativeOnly } from '@presentation/utils/nativeOnly';
import { widgetAccentColor } from '@presentation/components/widgets/widgetAccent';

// Küçültülmüş kartın özeti; yalnızca görünürken store'a abone olur
function CollapsedSummary({ id }: { readonly id: WidgetId }) {
  const snapshot = useHalkaStore((s) => s.snapshot);
  const currentAmbient = useUiStore((s) => s.currentAmbient);
  // Pomodoro geri sayımı için saniyelik yenileme
  const now = useNow(id === 'pomodoro' ? 1000 : 60_000);
  return (
    <AppText style={styles.summary} numberOfLines={1}>
      {getWidgetSummary(id, { snapshot, now, currentAmbient })}
    </AppText>
  );
}

interface WidgetCardProps {
  readonly id: WidgetId;
  readonly index?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly onLayoutChange?: (id: WidgetId, layout: { y: number; height: number }) => void;
}

export function WidgetCard({ id, index = 0, style, onLayoutChange }: WidgetCardProps) {
  const item = getCatalogItem(id);
  const accent = widgetAccentColor(item.accent);
  const navigation = useNavigation();
  const { removeWidget } = useLayout();
  const collapsed = useUiStore((s) => s.collapsed[id] ?? false);
  const toggleCollapsed = useUiStore((s) => s.toggleCollapsed);
  const play = useSoundEffect();

  const openFocus = () => navigation.navigate('WidgetFocus', { widgetId: id });

  const onCollapse = () => {
    play('click');
    toggleCollapsed(id);
  };

  return (
    <Animated.View
      entering={nativeOnly(FadeInDown.duration(450).delay(index * 50))}
      exiting={nativeOnly(ZoomOut.duration(240))}
      layout={nativeOnly(LinearTransition.springify().damping(18))}
      onLayout={(event) =>
        onLayoutChange?.(id, {
          y: event.nativeEvent.layout.y,
          height: event.nativeEvent.layout.height,
        })
      }
      style={[styles.card, { borderColor: withAlpha(accent, '33') }, style]}
    >
      <View style={[styles.accentLine, { backgroundColor: accent }]} />

      <View style={styles.header}>
        <Pressable
          onPress={openFocus}
          style={styles.titleArea}
          accessibilityRole="button"
          accessibilityLabel={`${item.name} eklentisine odaklan`}
        >
          <View style={[styles.iconBox, { backgroundColor: withAlpha(accent, '22') }]}>
            <Icon name={WIDGET_ICONS[id]} size={18} color={accent} />
          </View>
          <View style={styles.titleText}>
            <AppText style={styles.title} numberOfLines={1}>
              {item.name}
            </AppText>
            <AppText style={[styles.category, { color: accent }]}>{item.category}</AppText>
          </View>
          {collapsed ? <CollapsedSummary id={id} /> : null}
        </Pressable>

        <View style={styles.actions}>
          <IconButton icon="maximize-2" accessibilityLabel="Halkada odaklan" onPress={openFocus} />
          <IconButton
            icon={collapsed ? 'chevron-down' : 'chevron-up'}
            accessibilityLabel={collapsed ? 'Büyüt' : 'Küçült'}
            onPress={onCollapse}
          />
          <IconButton
            icon="x"
            tone="danger"
            accessibilityLabel="Bu eklentiyi sil"
            onPress={() => void removeWidget(id)}
          />
        </View>
      </View>

      {collapsed ? null : (
        <View style={styles.body}>
          <WidgetBody id={id} variant="compact" />
        </View>
      )}
    </Animated.View>
  );
}

const styles = themedStyles(() => ({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.bgCard,
    overflow: 'hidden',
  },
  accentLine: { height: 2, opacity: 0.8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  titleArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: { flexShrink: 1 },
  title: { fontFamily: fonts.semibold, fontSize: fontSizes.md },
  category: { fontSize: fontSizes.xs, fontFamily: fonts.medium },
  summary: {
    marginLeft: 'auto',
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  actions: { flexDirection: 'row', gap: spacing.xxs },
  body: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
}));
