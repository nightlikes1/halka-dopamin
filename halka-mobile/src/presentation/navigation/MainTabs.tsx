// Alt sekme çubuğu: Bugün · Odak · Karakter · Halka · İstatistik
// (Rehberler Faz 3'te Bugün/Karakter içinden açılacak).
// Parçacık stilinde yüzen cam çubuk ve parçacık Bugün/Odak ekranları kullanılır.
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { strings } from '@core/i18n/tr';
import { layout } from '@core/theme/layout';
import { colors, fonts, fontSizes, spacing } from '@core/theme/tokens';
import { ParticleTodayScreen } from '@features/activities/presentation/screens/ParticleTodayScreen';
import { TodayScreen } from '@features/activities/presentation/screens/TodayScreen';
import { CharacterScreen } from '@features/character/presentation/screens/CharacterScreen';
import { FocusScreen } from '@features/focus/presentation/screens/FocusScreen';
import { ParticleFocusScreen } from '@features/focus/presentation/screens/ParticleFocusScreen';
import { StatsScreen } from '@features/stats/presentation/screens/StatsScreen';
import { Icon, type IconName } from '@presentation/components/common/Icon';
import { GlassTabBar } from '@presentation/navigation/GlassTabBar';
import { TabScene } from '@presentation/navigation/TabScene';
import type { MainTabParamList } from '@presentation/navigation/types';
import { HomeScreen } from '@presentation/screens/HomeScreen';
import { themedStyles } from '@core/theme/themed';
import { useParticleStyle } from '@presentation/store/usePreferencesStore';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, IconName> = {
  Today: 'sun',
  Focus: 'target',
  Character: 'user',
  Halka: 'link',
  Stats: 'bar-chart-2',
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
      <Tab.Screen
        name="Today"
        component={particles ? ParticleTodayScreen : TodayScreen}
        options={{ title: strings.tabs.today }}
      />
      <Tab.Screen
        name="Focus"
        component={particles ? ParticleFocusScreen : FocusScreen}
        options={{ title: strings.tabs.focus }}
      />
      <Tab.Screen
        name="Character"
        component={CharacterScreen}
        options={{ title: strings.tabs.character }}
      />
      <Tab.Screen name="Halka" component={HomeScreen} options={{ title: strings.tabs.halka }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ title: strings.tabs.stats }} />
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
