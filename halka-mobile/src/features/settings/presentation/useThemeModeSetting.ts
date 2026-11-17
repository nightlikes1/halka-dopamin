// Tema ayarları: aile (Obsidyen / Halka) ve mod (sistem / koyu / açık). Seçim kaydedilir ve uygulama
// yeniden yüklenmeden uygulanır: renkler güncellenir, ekran ağacı yeni temayla yeniden kurulur
// (AppShell). Veri ve oturum korunur. "Sistem" seçiliyse telefonun ayarı değişince tema da değişir.
import { useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { strings } from '@core/i18n/tr';
import { applyTheme, resolveThemeMode, type ThemeFamily } from '@core/theme/tokens';
import {
  saveThemeFamily,
  saveThemeMode,
  type ThemeModePreference,
} from '@features/settings/data/devicePreferences';
import { usePreferencesStore } from '@presentation/store/usePreferencesStore';
import { showMessage } from '@presentation/utils/dialogs';
import { injectWebGlobalStyles } from '@presentation/utils/webGlobalStyles';

const t = strings.settings;

// Temayı uygular ve depoya yazar (kaydetmez)
export function commitTheme(family: ThemeFamily, preference: ThemeModePreference): void {
  const mode = resolveThemeMode(preference, Appearance.getColorScheme());
  applyTheme(family, mode);
  injectWebGlobalStyles();
  usePreferencesStore.getState().setTheme({
    themeFamily: family,
    themePreference: preference,
    themeMode: mode,
  });
}

export function useThemeModeSetting() {
  const selected = usePreferencesStore((s) => s.themePreference);
  const resolved = usePreferencesStore((s) => s.themeMode);

  const choose = async (preference: ThemeModePreference) => {
    if (preference === selected) return;
    if (!(await saveThemeMode(preference))) {
      showMessage(t.theme, t.themeFailed);
      return;
    }
    commitTheme(usePreferencesStore.getState().themeFamily, preference);
  };

  // Üst bardaki güneş/ay: görünen modun tersine geçer
  const toggle = () => choose(resolved === 'dark' ? 'light' : 'dark');

  return { selected, resolved, choose, toggle };
}

export function useThemeFamilySetting() {
  const selected = usePreferencesStore((s) => s.themeFamily);

  const choose = async (family: ThemeFamily) => {
    if (family === selected) return;
    if (!(await saveThemeFamily(family))) {
      showMessage(t.themeFamily, t.themeFailed);
      return;
    }
    commitTheme(family, usePreferencesStore.getState().themePreference);
  };

  return { selected, choose };
}

// "Sistem" seçiliyse telefonun açık/koyu ayarını izler (AppShell'de bir kez)
export function useSystemThemeSync(): void {
  const scheme = useColorScheme();
  useEffect(() => {
    const state = usePreferencesStore.getState();
    if (state.themePreference !== 'system') return;
    if (resolveThemeMode('system', scheme) === state.themeMode) return;
    commitTheme(state.themeFamily, 'system');
  }, [scheme]);
}
