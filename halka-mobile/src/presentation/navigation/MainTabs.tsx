// Alt sekme çubuğu: Bugün · Odak · Araçlar · Gelişim (Profil avatardan, Karakter Gelişim'den açılır).
// Parçacık stilinde yüzen cam çubuk ve parçacık Odak ekranı kullanılır.
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { colors, fonts, fontSizes, spacing } from '@core/theme/tokens';
import { FocusScreen } from '@features/focus/presentation/screens/FocusScreen';
import { ParticleFocusScreen } from '@features/focus/presentation/screens/ParticleFocusScreen';
import { GrowthScreen } from '@features/stats/presentation/screens/GrowthScreen';
import { TodayScreen } from '@features/today/presentation/screens/TodayScreen';
import { Icon, type IconName } from '@presentation/components/common/Icon';
import { GlassTabBar } from '@presentation/navigation/GlassTabBar';
import { TabScene } from '@presentation/navigation/TabScene';
import type { MainTabParamList } from '@presentation/navigation/types';
import { ToolsScreen } from '@features/tools/presentation/screens/ToolsScreen';
import { themedStyles } from '@core/theme/themed';
import { useParticleStyle } from '@presentation/store/usePreferencesStore';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, IconName> = {
  Today: 'sun',
  Focus: 'target',
  Tools: 'grid',
  Growth: 'trending-up',
};

export function MainTabs() {
  const insets = useSafeAreaInsets();
  const particles = useParticleStyle();
  return (
    <Tab.Navigator
      initialRouteName="Today"
      // Arka plandaki sekmeler ekran okuyucu ve klavye odağından gizlenir
      screenLayout={({ children }) => <TabScene>{children}</TabScene>}
      tabBar={particles ? (props) => <GlassTabBar {...props} icons={TAB_ICONS} /> : undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color }) => <Icon name={TAB_ICONS[route.name]} size={22} color={color} />,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: [
          styles.tabBar,
          { height: layout.tabBarHeight + Math.max(insets.bottom, spacing.lgx) },
        ],
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} options={{ title: strings.tabs.today }} />
      <Tab.Screen
        name="Focus"
        component={particles ? ParticleFocusScreen : FocusScreen}
        options={{ title: strings.tabs.focus }}
      />
      <Tab.Screen name="Tools" component={ToolsScreen} options={{ title: strings.tabs.tools }} />
      <Tab.Screen name="Growth" component={GrowthScreen} options={{ title: strings.tabs.growth }} />
    </Tab.Navigator>
  );
}

const styles = themedStyles(() => ({
  tabBar: {
    backgroundColor: colors.navBackground,
    borderTopWidth: 1,
    borderTopColor: colors.navBorder,
    paddingTop: spacing.sm,
  },
  item: { minHeight: layout.touchTarget },
  label: { fontFamily: fonts.semibold, fontSize: fontSizes.tag },
}));
