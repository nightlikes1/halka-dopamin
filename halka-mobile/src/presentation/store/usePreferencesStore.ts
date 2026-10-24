// Açılışta yüklenen cihaz tercihleri: görsel stil (oturum boyunca sabit), renk teması (anında
// değişir) ve karşılama ekranı durumu
import { create } from 'zustand';
import type { ColorScheme, ThemeMode } from '@core/theme/tokens';
import {
  DEFAULT_THEME_MODE,
  DEFAULT_VISUAL_STYLE,
  markOnboardingSeen,
} from '@data/preferences/devicePreferences';

interface PreferencesState {
  readonly visualStyle: ColorScheme;
  readonly themeMode: ThemeMode;
  readonly onboardingSeen: boolean;
  init(visualStyle: ColorScheme, themeMode: ThemeMode, onboardingSeen: boolean): void;
  setThemeMode(themeMode: ThemeMode): void;
  completeOnboarding(): void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  visualStyle: DEFAULT_VISUAL_STYLE,
  themeMode: DEFAULT_THEME_MODE,
  onboardingSeen: false,
  init: (visualStyle, themeMode, onboardingSeen) => set({ visualStyle, themeMode, onboardingSeen }),
  setThemeMode: (themeMode) => set({ themeMode }),
  completeOnboarding: () => {
    set({ onboardingSeen: true });
    void markOnboardingSeen();
  },
}));

// Parçacık ekranları mı, klasik ekranlar mı
export const useParticleStyle = () => usePreferencesStore((s) => s.visualStyle === 'particles');
