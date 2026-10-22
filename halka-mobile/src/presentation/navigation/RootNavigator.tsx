// Kök navigatör: oturum durumuna göre giriş ekranları veya ana uygulama
import {
  DarkTheme,
  NavigationContainer,
  type LinkingOptions,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@core/theme/tokens';
import { ForgotPasswordScreen } from '@features/auth/presentation/screens/ForgotPasswordScreen';
import { LoginScreen } from '@features/auth/presentation/screens/LoginScreen';
import { RegisterScreen } from '@features/auth/presentation/screens/RegisterScreen';
import { ResetPasswordScreen } from '@features/auth/presentation/screens/ResetPasswordScreen';
import { useAuthStore } from '@features/auth/presentation/useAuthStore';
import { AvatarEditorScreen } from '@features/character/presentation/screens/AvatarEditorScreen';
import { CharacterSetupScreen } from '@features/character/presentation/screens/CharacterSetupScreen';
import { TraitDetailScreen } from '@features/character/presentation/screens/TraitDetailScreen';
import { EveningCheckInScreen } from '@features/checkin/presentation/screens/EveningCheckInScreen';
import { HabitsScreen } from '@features/habits/presentation/screens/HabitsScreen';
import { OnboardingScreen } from '@features/onboarding/presentation/screens/OnboardingScreen';
import { HistoryScreen } from '@features/history/presentation/screens/HistoryScreen';
import { SettingsScreen } from '@features/settings/presentation/screens/SettingsScreen';
import { MainTabs } from '@presentation/navigation/MainTabs';
import type { RootStackParamList } from '@presentation/navigation/types';
import { usePreferencesStore } from '@presentation/store/usePreferencesStore';
import { CatalogScreen } from '@presentation/screens/CatalogScreen';
import { WidgetFocusScreen } from '@presentation/screens/WidgetFocusScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.textMain,
    background: colors.bgPrimary,
    card: colors.bgSecondary,
    text: colors.textMain,
    border: colors.borderGlass,
  },
};

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['halka://', 'http://localhost:8080', 'http://localhost:8081', '/'],
  config: {
    screens: {
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',
      ResetPassword: 'reset-password',
    },
  },
};

export function RootNavigator() {
  const signedIn = useAuthStore((s) => s.status === 'signedIn');
  // Karşılama ekranı yalnızca parçacık stilinde ve ilk açılışta (başlangıç rotası bir kez okunur)
  const showOnboarding = usePreferencesStore(
    (s) => s.visualStyle === 'particles' && !s.onboardingSeen,
  );

  return (
    <NavigationContainer theme={navigationTheme} linking={linking}>
      <Stack.Navigator
        initialRouteName={signedIn ? 'Main' : showOnboarding ? 'Onboarding' : 'Login'}
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgPrimary } }}
      >
        {signedIn ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="WidgetFocus"
              component={WidgetFocusScreen}
              options={{ animation: 'fade_from_bottom' }}
            />
            <Stack.Screen
              name="Catalog"
              component={CatalogScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="CheckIn"
              component={EveningCheckInScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Habits"
              component={HabitsScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="CharacterSetup"
              component={CharacterSetupScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="AvatarEditor"
              component={AvatarEditorScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="TraitDetail"
              component={TraitDetailScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </>
        ) : (
          <>
            {/* Görüldükten sonra kaydedilmez: çıkış yapınca yeniden açılmasın */}
            {showOnboarding ? (
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{ animation: 'fade' }}
              />
            ) : null}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
