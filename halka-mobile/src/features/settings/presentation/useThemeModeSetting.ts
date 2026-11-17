// Renk modu ayarı (sistem / koyu / açık). Seçim kaydedilir ve uygulama yeniden yüklenmeden uygulanır:
// renkler güncellenir, ekran ağacı yeni modla yeniden kurulur (AppShell). Veri ve oturum korunur.
// "Sistem" seçiliyse telefonun ayarı değişince mod da değişir.
import { useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { strings } from '@core/i18n/tr';
import { applyThemeMode, resolveThemeMode } from '@core/theme/tokens';
import { saveThemeMode, type ThemeModePreference } from '@features/settings/data/devicePreferences';
import { usePreferencesStore } from '@presentation/store/usePreferencesStore';
import { showMessage } from '@presentation/utils/dialogs';
import { injectWebGlobalStyles } from '@presentation/utils/webGlobalStyles';

const t = strings.settings;

// Modu uygular ve depoya yazar (kaydetmez)
function commitTheme(preference: ThemeModePreference): void {
  const mode = resolveThemeMode(preference, Appearance.getColorScheme());
  applyThemeMode(mode);
  injectWebGlobalStyles();
  usePreferencesStore.getState().setTheme({ themePreference: preference, themeMode: mode });
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
    commitTheme(preference);
  };

  // Üst bardaki güneş/ay: görünen modun tersine geçer
  const toggle = () => choose(resolved === 'dark' ? 'light' : 'dark');

  return { selected, resolved, choose, toggle };
}

// "Sistem" seçiliyse telefonun açık/koyu ayarını izler (AppShell'de bir kez)
export function useSystemThemeSync(): void {
  const scheme = useColorScheme();
  useEffect(() => {
    const state = usePreferencesStore.getState();
    if (state.themePreference !== 'system') return;
    if (resolveThemeMode('system', scheme) === state.themeMode) return;
    commitTheme('system');
  }, [scheme]);
}
