// Yüzen cam sekme çubuğu (parçacık stili): kenarlardan 12 px içeride, alttan 16 px yukarıda.
// İçerik çubuğun altından akar; ekranlar useTabBarClearance kadar alt boşluk bırakır.
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { layout } from '@core/theme/layout';
import { colors, fonts, radius, spacing } from '@core/theme/tokens';
import { AppText } from '@presentation/components/common/AppText';
import { Icon, type IconName } from '@presentation/components/common/Icon';
import { ScalePressable } from '@presentation/components/common/ScalePressable';
import { themedStyles } from '@core/theme/themed';

export const GLASS_BAR_HEIGHT = 64;
export const GLASS_BAR_INSET = 12;
export const GLASS_BAR_BOTTOM = 16;

interface GlassTabBarProps extends BottomTabBarProps {
  readonly icons: Readonly<Record<string, IconName>>;
}

export function GlassTabBar({ state, descriptors, navigation, icons }: GlassTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.bar, { bottom: GLASS_BAR_BOTTOM + insets.bottom }]}
      accessibilityRole="tablist"
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const options = descriptors[route.key]?.options;
        const label = typeof options?.title === 'string' ? options.title : route.name;
        const color = focused ? colors.textPrimary : colors.textSecondary;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <ScalePressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            aria-selected={focused}
            accessibilityLabel={label}
            containerStyle={styles.slot}
            style={styles.item}
          >
            <Icon name={icons[route.name] ?? 'circle'} size={22} color={color} />
            <AppText variant="tag" style={[styles.label, { color }, focused && styles.active]}>
              {label}
            </AppText>
          </ScalePressable>
        );
      })}
    </View>
  );
}

// Yüzen çubuğun altında kalmaması için kaydırılan içeriğe eklenecek boşluk
export function useTabBarClearance(): number {
  const insets = useSafeAreaInsets();
  return GLASS_BAR_HEIGHT + GLASS_BAR_BOTTOM + insets.bottom + spacing.lg;
}

const styles = themedStyles(() => ({
  bar: {
    position: 'absolute',
    left: GLASS_BAR_INSET,
    right: GLASS_BAR_INSET,
    height: GLASS_BAR_HEIGHT,
    flexDirection: 'row',
    borderRadius: radius.bar,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassBar,
    paddingHorizontal: spacing.xs,
  },
  slot: { flex: 1 },
  item: {
    minHeight: layout.touchTarget,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  label: { fontFamily: fonts.medium },
  active: { fontFamily: fonts.bold },
}));
