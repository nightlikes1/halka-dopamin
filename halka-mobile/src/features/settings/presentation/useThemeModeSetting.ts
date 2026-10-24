// Renk teması ayarı (koyu / açık). Seçim kaydedilir ve uygulama yeniden yüklenmeden uygulanır:
// renkler güncellenir, ekran ağacı yeni temayla yeniden kurulur (AppShell). Veri ve oturum korunur.
import { strings } from '@core/i18n/tr';
import { applyThemeMode } from '@core/theme/tokens';
import { saveThemeMode, type ThemeModePreference } from '@data/preferences/devicePreferences';
import { usePreferencesStore } from '@presentation/store/usePreferencesStore';
import { showMessage } from '@presentation/utils/dialogs';
import { injectWebGlobalStyles } from '@presentation/utils/webGlobalStyles';

const t = strings.settings;

export function useThemeModeSetting() {
  const selected = usePreferencesStore((s) => s.themeMode);

  const choose = async (mode: ThemeModePreference) => {
    if (mode === selected) return;
    if (!(await saveThemeMode(mode))) {
      showMessage(t.theme, t.themeFailed);
      return;
    }
    applyThemeMode(mode);
    injectWebGlobalStyles();
    usePreferencesStore.getState().setThemeMode(mode);
  };

  const toggle = () => choose(selected === 'dark' ? 'light' : 'dark');

  return { selected, choose, toggle };
}
