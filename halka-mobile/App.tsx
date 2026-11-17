// Uygulama girişi: cihaz tercihleri → renk paleti (koyu/açık) → fontlar, DI container ve uygulama kabuğu.
// Ekran modülleri (StyleSheet'ler renkleri yüklenirken okur) seçilen palet uygulandıktan sonra
// yüklenir; bu yüzden AppShell tembel (lazy) import edilir.
// Yalnızca kullanılan ağırlıklar alt yoldan import edilir (paket kökü tüm fontları pakete ekler)
import { Inter_200ExtraLight } from '@expo-google-fonts/inter/200ExtraLight';
import { Inter_300Light } from '@expo-google-fonts/inter/300Light';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useFonts } from 'expo-font';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Appearance, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createContainer } from '@core/di/container';
import { applyColorScheme, applyThemeMode, colors, resolveThemeMode } from '@core/theme/tokens';
import { loadDevicePreferences } from '@features/settings/data/devicePreferences';
import { DIProvider } from '@presentation/providers/DIProvider';
import { usePreferencesStore } from '@presentation/store/usePreferencesStore';
import { injectWebGlobalStyles } from '@presentation/utils/webGlobalStyles';

const AppShell = lazy(() =>
  import('@presentation/AppShell').then((module) => ({ default: module.AppShell })),
);

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const container = useMemo(() => createContainer(), []);
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    void loadDevicePreferences().then((prefs) => {
      applyColorScheme(prefs.visualStyle);
      const mode = resolveThemeMode(prefs.themeMode, Appearance.getColorScheme());
      applyThemeMode(mode);
      // Web'de otomatik doldurma ve sayfa zemini için global CSS (mobilde etkisiz)
      injectWebGlobalStyles();
      usePreferencesStore
        .getState()
        .init(
          prefs.visualStyle,
          { themePreference: prefs.themeMode, themeMode: mode },
          prefs.onboardingSeen,
        );
      setThemeReady(true);
    });
  }, []);

  const blank = <View style={[styles.blank, { backgroundColor: colors.background }]} />;
  if (!themeReady) return blank;

  return (
    <SafeAreaProvider>
      <DIProvider container={container}>
        <Suspense fallback={blank}>
          {/* Font yüklenemese bile sistem fontuyla devam edilir */}
          <AppShell fontsReady={fontsLoaded || fontError !== null} />
        </Suspense>
      </DIProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  blank: { flex: 1 },
});
