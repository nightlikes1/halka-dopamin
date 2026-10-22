// Görsel stil ayarı (parçacık / klasik). Renkler açılışta bir kez uygulandığı için seçim kaydedilip
// uygulama yeniden yüklenir: web'de sayfa, geliştirme modunda DevSettings; mağaza sürümünde
// kullanıcıya yeniden açınca uygulanacağı söylenir.
import { useState } from 'react';
import { DevSettings, Platform } from 'react-native';
import { strings } from '@core/i18n/tr';
import { saveVisualStyle, type VisualStyle } from '@data/preferences/devicePreferences';
import { usePreferencesStore } from '@presentation/store/usePreferencesStore';
import { showMessage } from '@presentation/utils/dialogs';

const t = strings.settings;

export function useVisualStyleSetting() {
  const active = usePreferencesStore((s) => s.visualStyle);
  const [selected, setSelected] = useState<VisualStyle>(active);

  const choose = async (style: VisualStyle) => {
    if (style === selected) return;
    setSelected(style);
    if (!(await saveVisualStyle(style))) {
      setSelected(active);
      showMessage(t.visualStyle, t.visualStyleFailed);
      return;
    }
    if (Platform.OS === 'web') {
      globalThis.location?.reload();
      return;
    }
    if (__DEV__) {
      DevSettings.reload();
      return;
    }
    showMessage(t.visualStyle, t.visualStyleRestart);
  };

  return { selected, choose };
}
