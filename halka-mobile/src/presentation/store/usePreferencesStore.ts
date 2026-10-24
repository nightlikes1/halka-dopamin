// Açılışta yüklenen cihaz tercihleri: görsel stil ve renk teması (oturum boyunca sabit),
// karşılama ekranı durumu
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
  completeOnboarding(): void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  visualStyle: DEFAULT_VISUAL_STYLE,
  themeMode: DEFAULT_THEME_MODE,
  onboardingSeen: false,
  init: (visualStyle, themeMode, onboardingSeen) => set({ visualStyle, themeMode, onboardingSeen }),
  completeOnboarding: () => {
    set({ onboardingSeen: true });
    void markOnboardingSeen();
  },
}));

// Parçacık ekranları mı, klasik ekranlar mı
export const useParticleStyle = () => usePreferencesStore((s) => s.visualStyle === 'particles');
