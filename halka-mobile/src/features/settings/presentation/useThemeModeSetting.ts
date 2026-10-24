// Renk teması ayarı (koyu / açık). Seçim kaydedilip uygulama yeniden yüklenir (reloadToApply).
import { useState } from 'react';
import { strings } from '@core/i18n/tr';
import { saveThemeMode, type ThemeModePreference } from '@data/preferences/devicePreferences';
import { reloadToApply } from '@features/settings/presentation/reloadToApply';
import { usePreferencesStore } from '@presentation/store/usePreferencesStore';
import { showMessage } from '@presentation/utils/dialogs';

const t = strings.settings;

export function useThemeModeSetting() {
  const active = usePreferencesStore((s) => s.themeMode);
  const [selected, setSelected] = useState<ThemeModePreference>(active);

  const choose = async (mode: ThemeModePreference) => {
    if (mode === selected) return;
    setSelected(mode);
    if (!(await saveThemeMode(mode))) {
      setSelected(active);
      showMessage(t.theme, t.themeFailed);
      return;
    }
    reloadToApply(t.theme, t.themeRestart);
  };

  const toggle = () => choose(selected === 'dark' ? 'light' : 'dark');

  return { selected, choose, toggle };
}
