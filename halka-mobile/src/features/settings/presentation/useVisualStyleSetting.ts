// Görsel stil ayarı (parçacık / klasik). Seçim kaydedilip uygulama yeniden yüklenir (reloadToApply).
import { useState } from 'react';
import { strings } from '@core/i18n/tr';
import { saveVisualStyle, type VisualStyle } from '@data/preferences/devicePreferences';
import { reloadToApply } from '@features/settings/presentation/reloadToApply';
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
    reloadToApply(t.visualStyle, t.visualStyleRestart);
  };

  return { selected, choose };
}
